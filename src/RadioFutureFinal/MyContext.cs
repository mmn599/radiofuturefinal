using RadioFutureFinal.DAL;
using RadioFutureFinal.WebSockets;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal
{
    public class MyContext
    {
        IDbRepository _db;
        IWebSocketSender _wsSender;
        Timer _cleaningTimer;

        // key is session id
        ConcurrentDictionary<int, List<MySocket>> ActiveSessions { get; }
        ConcurrentDictionary<WebSocket, MySocket> ActiveSockets { get; }

        public MyContext(IDbRepository db, WebSocketSenderFactory wsSenderFactory)
        {
            _db = db;
            ActiveSockets = new ConcurrentDictionary<WebSocket, MySocket>();
            ActiveSessions = new ConcurrentDictionary<int, List<MySocket>>();

            _wsSender = wsSenderFactory.CreateWebSocketSender(BadSend);

            _cleaningTimer = new Timer((e) =>
            {
                SynchronizeUserMediaStates();
            }, null, 0, 5000);
        }

        public MySocket GetMySocket(WebSocket socket)
        {
            MySocket mySocket;
            var found = ActiveSockets.TryGetValue(socket, out mySocket);
            if(!found)
            {
                // TODO: exception
            }
            return mySocket;
        }

        public List<MySocket> GetSocketsInSession(int sessionId)
        {
            List<MySocket> socketsInSession;
            var found = ActiveSessions.TryGetValue(sessionId, out socketsInSession);

            if(!found)
            {
                // TODO: throw exception
            }

            return socketsInSession;
        }

        public void SocketConnected(WebSocket socket)
        {
            var mySocket = new MySocket(socket);
            ActiveSockets.TryAdd(socket, mySocket);
        }

        public void SocketJoinSession(MySocket socket, int sessionId, int userId)
        {
            List<MySocket> sessionSockets;
            var sessionFound = ActiveSessions.TryGetValue(sessionId, out sessionSockets);

            if(sessionFound)
            {
                sessionSockets.Add(socket);
            }
            else
            {
                // First socket in the session
                var result = ActiveSessions.TryAdd(sessionId, new List<MySocket>() { socket });
                if(result == false)
                {
                    // TODO: throw exception
                }
            }

            socket.AddSessionInfoToSocket(sessionId, userId);
        }

        private void DeactiveSession(int sessionId)
        {
            List<MySocket> socketsInSession;
            var found = ActiveSessions.TryRemove(sessionId, out socketsInSession);
            if(!found)
            {
                // TODO: throw exception
            }
            if(socketsInSession.Count != 0)
            {
                // TODO: throw exception
            }
        }

        // TODO: terrible name
        private List<MySocket> RemoveSocketFromDataStructures(MySocket socket)
        {
            var found = ActiveSockets.TryRemove(socket.WebSocket, out socket);
            if(!found)
            {
                // TODO: throw exception
            }
            List<MySocket> socketsInSession;
            found = ActiveSessions.TryGetValue(socket.SessionId, out socketsInSession);
            if(!found)
            {
                // TODO: throw exception
            }
            socketsInSession.Remove(socket);

            return socketsInSession;
        }

        public async Task RemoveSocketFromContext(MySocket mySocket)
        {
            var sessionId = mySocket.SessionId;
            var userId = mySocket.UserId;

            var remainingSocketsInSession = RemoveSocketFromDataStructures(mySocket);

            if(remainingSocketsInSession.Count == 0)
            {
                DeactiveSession(sessionId);
            }

            var updatedSession = await _db.RemoveUserFromSessionAsync(sessionId, userId);
            if (remainingSocketsInSession.Count > 0)
            {
                await _wsSender.ClientsUpdateSessionUsers(updatedSession, remainingSocketsInSession);
            }
        }

        public async Task RemoveSocketFromContext(WebSocket socket)
        {
            var mySocket = GetMySocket(socket);
            await RemoveSocketFromContext(mySocket);
        }

        public async Task BadSend(WebSocket webSocket)
        {
            await RemoveSocketFromContext(webSocket);
        }

        // Long running function that updates user video states across the session
        // TODO: minimuze clients calling "UpdateUserVideo" state and instead interpolate and update infrequently
        public async Task SynchronizeUserMediaStates()

        {
            // TODO: check to make sure at scale this function won't overrun itself
            foreach(var kvPair in ActiveSessions)
            {
                int sessionId = kvPair.Key;
                List<MySocket> socketsInSession = kvPair.Value;
                var session = _db.GetSession(sessionId);
                await _wsSender.ClientsUpdateSessionUsers(session, socketsInSession);
            }
        }

        private string CreateConnectionId()
        {
            return Guid.NewGuid().ToString();
        }
    }
}

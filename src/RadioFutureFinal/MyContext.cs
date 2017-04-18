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
        private IDbRepository _db;
        private Timer _cleaningTimer;

        public ConcurrentDictionary<WebSocket, MySocket> ActiveSockets { get; }
        // key is session id
        public ConcurrentDictionary<int, List<MySocket>> ActiveSessions { get; }


        public MyContext(IDbRepository db)
        {
            _db = db;
            ActiveSockets = new ConcurrentDictionary<WebSocket, MySocket>();
            ActiveSessions = new ConcurrentDictionary<int, List<MySocket>>();

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

        public IEnumerable<MySocket> GetSocketsInSession(int sessionId)
        {
            List<MySocket> socketsInSession;
            var found = ActiveSessions.TryGetValue(sessionId, out socketsInSession);

            if(!found)
            {
                // TODO: throw exception
            }

            return socketsInSession;
        }

        public void AddSocket(WebSocket socket)
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

        public void RemoveSocket(WebSocket socket)
        {
            MySocket mySocket;
            var found = ActiveSockets.TryRemove(socket, out mySocket);
            
            if(!found)
            {
                // TODO: throw exception
            }

            List<MySocket> socketsInSession;
            var sessionId = mySocket.SessionId;
            found = ActiveSessions.TryGetValue(sessionId, out socketsInSession);
            
            if(!found)
            {
                // TODO: throw exception
            }

            socketsInSession.Add(mySocket);
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
                await ClientMessages.ClientsUpdateSessionUsers(session, socketsInSession);
            }
        }

        private string CreateConnectionId()
        {
            return Guid.NewGuid().ToString();
        }


    }
}

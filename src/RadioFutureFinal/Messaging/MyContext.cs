using RadioFutureFinal.DAL;
using RadioFutureFinal.Messaging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MyContext : IMyContext
    {
        IDbRepository _db;
        IMessageSender _wsSender;

        // key is session id
        ConcurrentDictionary<int, List<MySocket>> _activeSession;
        ConcurrentDictionary<WebSocket, MySocket> _activeSockets;

        public MyContext(IDbRepository db, IMessageSender wsSender)
        {
            _db = db;
            _wsSender = wsSender;
            _activeSockets = new ConcurrentDictionary<WebSocket, MySocket>();
            _activeSession = new ConcurrentDictionary<int, List<MySocket>>();
        }

        public MySocket GetMySocket(WebSocket socket)
        {
            MySocket mySocket;
            var found = _activeSockets.TryGetValue(socket, out mySocket);
            if(!found)
            {
                // TODO: exception
            }
            return mySocket;
        }

        public MySocket GetSocketIdForUser(int sessionId, int userId)
        {
            var socketsInSession = GetSocketsInSession(sessionId);
            var userSocket = socketsInSession.Find(s => s.UserId == userId);
            if(userSocket == null)
            {
                // TODO: exception 
            }
            return userSocket;
        }

        public List<MySocket> GetSocketsInSession(int sessionId)
        {
            List<MySocket> socketsInSession;
            var found = _activeSession.TryGetValue(sessionId, out socketsInSession);

            if(!found)
            {
                // TODO: throw exception
            }

            return socketsInSession;
        }

        public void SocketConnected(WebSocket socket)
        {
            var mySocket = new MySocket(socket);
            _activeSockets.TryAdd(socket, mySocket);
        }

        public void SocketJoinSession(MySocket socket, int sessionId, int userId)
        {
            List<MySocket> sessionSockets;
            var sessionFound = _activeSession.TryGetValue(sessionId, out sessionSockets);

            if(sessionFound)
            {
                sessionSockets.Add(socket);
            }
            else
            {
                // First socket in the session
                var result = _activeSession.TryAdd(sessionId, new List<MySocket>() { socket });
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
            var found = _activeSession.TryRemove(sessionId, out socketsInSession);
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
            var found = _activeSockets.TryRemove(socket.WebSocket, out socket);
            if(!found)
            {
                // TODO: throw exception
            }
            List<MySocket> socketsInSession;
            found = _activeSession.TryGetValue(socket.SessionId, out socketsInSession);
            if(!found)
            {
                // TODO: throw exception
            }
            socketsInSession.Remove(socket);

            return socketsInSession;
        }

        public async Task SocketDisconnected(WebSocket socket)
        {
            var mySocket = GetMySocket(socket);

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

        private string CreateConnectionId()
        {
            return Guid.NewGuid().ToString();
        }
    }
}

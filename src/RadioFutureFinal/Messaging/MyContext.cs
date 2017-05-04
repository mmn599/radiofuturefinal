using Microsoft.Extensions.Configuration;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Errors;
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
        IConfigurationRoot _config;

        // key is session id
        // TODO: these data structures are wasteful and are O(n) with respect to the nubmer of users logged on
        ConcurrentDictionary<int, ConcurrentDictionary<WebSocket, MySocket>> _activeSession;
        ConcurrentDictionary<WebSocket, MySocket> _activeSockets;

        public MyContext(IConfigurationRoot configuration, IDbRepository db, MessageSenderFactory senderFactory)
        {
            _config = configuration;
            _db = db;
            _wsSender = senderFactory.Create(SocketDisconnected);
            _activeSockets = new ConcurrentDictionary<WebSocket, MySocket>();
            _activeSession = new ConcurrentDictionary<int, ConcurrentDictionary<WebSocket, MySocket>>();
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
            var userSocket = socketsInSession.Values.First(s => s.UserId == userId);
            if(userSocket == null)
            {
                // TODO: exception 
                throw new RadioException("couldnt find user socket");
            }
            return userSocket;
        }

        public ConcurrentDictionary<WebSocket,MySocket> GetSocketsInSession(int sessionId)
        {
            ConcurrentDictionary<WebSocket,MySocket> socketsInSession;
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
            ConcurrentDictionary<WebSocket,MySocket> sessionSockets;
            var sessionFound = _activeSession.TryGetValue(sessionId, out sessionSockets);

            if(sessionFound)
            {
                sessionSockets.TryAdd(socket.WebSocket, socket);
            }
            else
            {
                // First socket in the session
                var newDict = new ConcurrentDictionary<WebSocket, MySocket>();
                newDict.TryAdd(socket.WebSocket, socket);
                var result = _activeSession.TryAdd(sessionId, newDict);
                if(result == false)
                {
                    // TODO: throw exception
                }
            }

            socket.AddSessionInfoToSocket(sessionId, userId);
        }

        private void DeactiveSession(int sessionId)
        {
            ConcurrentDictionary<WebSocket,MySocket> socketsInSession;
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
        private ConcurrentDictionary<WebSocket,MySocket> RemoveSocketFromDataStructures(MySocket socket)
        {
            var found = _activeSockets.TryRemove(socket.WebSocket, out socket);
            if(!found)
            {
                // TODO: throw exception
                throw new RadioException("Could not find my socket!");
            }
            ConcurrentDictionary<WebSocket,MySocket> socketsInSession;
            found = _activeSession.TryGetValue(socket.SessionId, out socketsInSession);
            if(!found)
            {
                throw new RadioException("Could not find session in activeSession struct!");
            }
            MySocket removedSocket;
            found = socketsInSession.TryRemove(socket.WebSocket, out removedSocket);
            if(!found)
            {
                throw new RadioException("Could not find socket to remove in socketsInSession!");
            }

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

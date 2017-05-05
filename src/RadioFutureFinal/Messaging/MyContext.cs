using Microsoft.Extensions.Configuration;
using RadioFutureFinal.Contracts;
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
        IActionsClient _wsSender;
        IConfigurationRoot _config;

        // key is session id
        // TODO: these data structures are wasteful 
        ConcurrentDictionary<int, ConcurrentBag<MySocket>> _activeSessions;
        ConcurrentDictionary<WebSocket, MySocket> _activeSockets;

        public MyContext(IConfigurationRoot configuration, IDbRepository db, MessageSenderFactory senderFactory)
        {
            _config = configuration;
            _db = db;
            _wsSender = senderFactory.Create(SocketDisconnected);
            _activeSockets = new ConcurrentDictionary<WebSocket, MySocket>();
            _activeSessions = new ConcurrentDictionary<int, ConcurrentBag<MySocket>>();
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

        // TODO: O(n), probably should have a hashmap just for this
        public MySocket GetSocketForUser(int sessionId, int userId)
        {
            var socketsInSession = GetSocketsInSession(sessionId);
            var userSocket = socketsInSession.First(s => s.UserId == userId);
            if(userSocket == null)
            {
                throw new RadioException("couldnt find user socket");
            }
            return userSocket;
        }

        public IEnumerable<MySocket> GetSocketsInSession(int sessionId)
        {
            ConcurrentBag<MySocket> sockets;
            var found = _activeSessions.TryGetValue(sessionId, out sockets);
            if(!found)
            {
                throw new RadioException("Session not found in active sessions.");
            }
            return sockets;
        }

        public void SocketConnected(WebSocket socket)
        {
            var mySocket = new MySocket(socket);
            _activeSockets.TryAdd(socket, mySocket);
        }

        public void SocketJoinSession(MySocket socket, int sessionId, int userId)
        {
            ConcurrentBag<MySocket> sessionSockets;
            var sessionFound = _activeSessions.TryGetValue(sessionId, out sessionSockets);

            if(sessionFound)
            {
                sessionSockets.Add(socket);
            }
            else
            {
                // First socket in the session
                var newBag = new ConcurrentBag<MySocket>();
                newBag.Add(socket);
                var result = _activeSessions.TryAdd(sessionId, newBag);
                if(result == false)
                {
                    throw new RadioException("Couldn't add new session to active sessions.");
                }
            }

            socket.AddSessionInfoToSocket(sessionId, userId);
        }

        private void DeactiveSession(int sessionId)
        {
            ConcurrentBag<MySocket> socketsInSession;
            var found = _activeSessions.TryRemove(sessionId, out socketsInSession);
            if(socketsInSession.Count != 0)
            {
                // TODO: throw exception
            }
        }

        private ConcurrentBag<MySocket> RemoveSocketFromDataStructures(MySocket socketToRemove)
        {
            var remainingSockets = new List<MySocket>(); 

            var found = _activeSockets.TryRemove(socketToRemove.WebSocket, out socketToRemove);
            if(!found)
            {
                throw new RadioException("Could not find my socket!");
            }

            ConcurrentBag<MySocket> socketsInSession;
            found = _activeSessions.TryGetValue(socketToRemove.SessionId, out socketsInSession);
            if(!found)
            {
                throw new RadioException("Could not find session in activeSession struct!");
            }

            var updatedSocketsInSession = new ConcurrentBag<MySocket>();
            foreach(var socket in socketsInSession)
            {
                if(!socket.Equals(socketToRemove))
                {
                    updatedSocketsInSession.Add(socket);
                }
            }
            _activeSessions.AddOrUpdate(socketToRemove.SessionId, updatedSocketsInSession, 
                (key, oldSockets) => updatedSocketsInSession);

            return updatedSocketsInSession;
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
            var sessionV1 = updatedSession.ToContract();
            if (remainingSocketsInSession.Count > 0)
            {
                await _wsSender.clientUpdateUsersList(sessionV1.Users, remainingSocketsInSession);
            }
        }

        private string CreateConnectionId()
        {
            return Guid.NewGuid().ToString();
        }
    }
}

using Microsoft.Extensions.Configuration;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Errors;
using RadioFutureFinal.External;
using RadioFutureFinal.Messaging;
using RadioFutureFinal.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    // This class is messy and inefficient. Needs some cleanup.
    // Goal: get rid of _wsSender variable here, and _db variable in receiver

    public class MyContext : IMyContext
    {
        IDbRepository _db;
        IActionsClient _wsSender;
        IConfigurationRoot _config;
        SSOManager _ssoManager;

        // key is session id
        // TODO: these data structures are wasteful 
        ConcurrentDictionary<int, ConcurrentBag<MySocket>> _activeSessions;
        ConcurrentDictionary<WebSocket, MySocket> _activeSockets;

        public MyContext(IConfigurationRoot configuration, IDbRepository db, MessageSenderFactory senderFactory,
            SSOManager ssoManager)
        {
            _config = configuration;
            _db = db;
            _wsSender = senderFactory.Create(SocketDisconnected);
            _activeSockets = new ConcurrentDictionary<WebSocket, MySocket>();
            _activeSessions = new ConcurrentDictionary<int, ConcurrentBag<MySocket>>();
            _ssoManager = ssoManager;
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

        public void _socketJoinSession(MySocket socket, int sessionId, int userId)
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

        private void _deactiveSession(int sessionId)
        {
            ConcurrentBag<MySocket> socketsInSession;
            var found = _activeSessions.TryRemove(sessionId, out socketsInSession);
        }

        private ConcurrentBag<MySocket> _removeSocket(MySocket socketToRemove)
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

        private async Task<Session> _removeUserFromSession(int sessionId, int userId)
        {
            var updatedSession = await _db.RemoveUserFromSessionAsync(sessionId, userId);
            var user = _db.GetUser(userId);
            if(user.Temporary)
            {
                await _db.DeleteUserAsync(userId);
            }
            return updatedSession;
        }

        public async Task SocketDisconnected(WebSocket socket)
        {
            var mySocket = GetMySocket(socket);

            var sessionId = mySocket.SessionId;
            var userId = mySocket.UserId;

            var remainingSocketsInSession = _removeSocket(mySocket);
            var updatedSession = await _removeUserFromSession(sessionId, userId);

            var sessionV1 = updatedSession.ToContract();

            if (remainingSocketsInSession.Count > 0)
            {
                await _wsSender.clientUpdateUsersList(sessionV1.Users, remainingSocketsInSession);
            }
            else
            {
                _deactiveSession(sessionId);
            }
        }

        private async Task<Session> _getSessionByName(string sessionName)
        {
            Session session = null;
            bool sessionFound = _db.GetSessionByName(sessionName, out session);
            if(!sessionFound)
            {
                session = await _db.CreateSessionAsync(sessionName);
            }
            return session;
        }

        public async Task<SessionJoinResult> TempUserJoinSession(MySocket socket, string sessionName)
        {
            var user = await _db.AddNewTempUser();
            var session = await _getSessionByName(sessionName);
            await _db.AddUserToSessionAsync(user.MyUserId, session);

            _socketJoinSession(socket, session.SessionID, user.MyUserId);

            var result = new SessionJoinResult()
            {
                Session = session,
                User = user
            };
            return result;
        }

        public async Task<SessionJoinResult> SwitchUserInSession(MySocket socket, int oldUserId, long fbUserId)
        {
            MyUser user = _ssoManager.GetOrCreateFbUser(fbUserId);

            var updatedSession = await _removeUserFromSession(socket.SessionId, oldUserId);
            var socketsInSession = GetSocketsInSession(socket.SessionId);
            updatedSession = await _db.AddUserToSessionAsync(user.MyUserId, updatedSession);

            socket.UserId = user.MyUserId;
            var result = new SessionJoinResult()
            {
                Session = updatedSession,
                User = user
            };
            return result;
        }
    }

    public class SessionJoinResult
    {
        public Session Session { get; set; }
        public MyUser User { get; set; }
    }

}

using Newtonsoft.Json;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Errors;
using RadioFutureFinal.Models;
using RadioFutureFinal.Search;
using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MessageReceiver : IMessageReceiver, IServerActions
    {
        IMyContext _myContext;
        IDbRepository _db;
        IMessageSender _sender;
        Searcher _searcher;

        public MessageReceiver(IDbRepository db, IMyContext myContext, MessageSenderFactory senderFactory, Searcher searcher)
        {
            _myContext = myContext;
            _db = db;
            _sender = senderFactory.Create(_myContext.SocketDisconnected);
            _searcher = searcher;
        }

        public async Task HandleMessage(dynamic json, WebSocket senderSocket)
        {
            string action = Convert.ToString(json.action);
            if(string.IsNullOrEmpty(action))
            {
                throw new RadioException("No action in message.");
            }

            var thisType = GetType();
            var methodInfo = thisType.GetMethod(action);
            var methodParameters = methodInfo.GetParameters();
            
            object[] arguments = new object[methodParameters.Length];
            for(int i=0; i<arguments.Length; i++)
            {
                var parameter = methodParameters[i]; 
                var paramName = parameter.Name;
                var paramType = parameter.GetType();
                object paramVal;
                if(paramType.Equals(typeof(MySocket)))
                {
                    paramVal = _myContext.GetMySocket(senderSocket); 
                }
                else
                {
                    paramVal = json.GetType().GetProperty(paramName).GetValue(json, null);
                    if(paramVal == null)
                    {
                        throw new RadioException("Message was missing: " + paramName + " parameter.");
                    }
                }
                arguments[i] = paramVal;
            }

            await (Task) methodInfo.Invoke(this, arguments);
        }

        // TODO: significant bug where additional session is created with same name if two request are made in similar times. I may have fixed it
        // TODO: WsMessage shouldn't be same for every message
        public async Task JoinSession(MySocket socket, string sessionName)
        {
            Session session = null;
            bool sessionFound = _db.GetSessionByName(sessionName, out session);
            if(!sessionFound)
            {
                session = await _db.CreateSessionAsync(sessionName);
            }
            var userName = "Anonymous";
            var user = await _db.AddNewUserToSessionAsync(userName, session);

            var sessionId = session.SessionID;

            _myContext.SocketJoinSession(socket, sessionId, user.MyUserId);

            await _sender.ClientSessionReady(socket, session, user);
            await _sender.ClientsUpdateSessionUsers(session, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task AddMediaToSession(MySocket socket, MediaV1 media)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.AddMediaToSessionAsync(media.ToModel(), sessionId);
            await _sender.ClientsUpdateSessionQueue(updatedSession, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task DeleteMediaFromSession(MySocket socket, int mediaId)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.RemoveMediaAsync(sessionId, mediaId);
            await _sender.ClientsUpdateSessionQueue(updatedSession, _myContext.GetSocketsInSession(sessionId));
        }

        // TODO: don't use whole session
        public async Task SaveUserNameChange(MySocket socket, int userId, string newName)
        {
            await _db.UpdateUserNameAsync(userId, newName);
            var sessionId = socket.SessionId;
            var session = _db.GetSession(sessionId);
            await _sender.ClientsUpdateSessionUsers(session, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task ChatMessage(MySocket socket, string chatMessage, string userName)
        {
            await _sender.ClientsSendChatMessage(chatMessage, _myContext.GetSocketsInSession(socket.SessionId));
        }

        public async Task RequestSyncWithUser(MySocket socket, int userIdRequestee)
        {
            var userIdRequestor = socket.UserId;
            var socketRequestee = _myContext.GetSocketIdForUser(socket.SessionId, userIdRequestee);
            await _sender.ClientRequestUserState(userIdRequestor, userIdRequestee, socketRequestee);
        }

        public async Task ProvideSyncToUser(MySocket socket, UserState userState, int userIdRequestor)
        {
            // TODO: user ID represents the user to send to. this is stupid. WsMessage needs to be split up.
            var socketToSendTo = _myContext.GetSocketIdForUser(socket.SessionId, userIdRequestor);
            await _sender.ClientProvideUserState(userState, socketToSendTo);
        }

        public async Task Search(MySocket socket, string query, int page)
        {
            // TODO: dumb
            var searchResults = await _searcher.searchPodcasts(query, page);
            await _sender.ClientSearchResults(socket, searchResults);
        }

    }
}

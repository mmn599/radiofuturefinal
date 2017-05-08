using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Errors;
using RadioFutureFinal.Models;
using RadioFutureFinal.Search;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Net.WebSockets;
using System.Reflection;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MessageReceiver : IActionsServer, IMessageReceiver
    {
        IMyContext _myContext;
        IDbRepository _db;
        IActionsClient _sender;
        Searcher _searcher;
        Dictionary<string, ResponseFunction> _responseFunctions;
        
        public delegate Task ResponseFunction(MySocket socket, JObject json);

        public MessageReceiver(IDbRepository db, IMyContext myContext, MessageSenderFactory senderFactory, Searcher searcher)
        {
            _myContext = myContext;
            _db = db;
            _sender = senderFactory.Create(_myContext.SocketDisconnected);
            _searcher = searcher;

            _responseFunctions = Mapper.BuildResponseFunctions(this);
        }

        public async Task HandleMessage(string json, WebSocket senderSocket)
        {
            var jObject = JObject.Parse(json);
            string action;
            try
            {
                action = jObject["action"].ToObject<string>();
            }
            catch
            {
                throw new RadioException("Couldn't parse action from json.");
            }

            var mySocket = _myContext.GetMySocket(senderSocket);

            ResponseFunction response;
            var found = _responseFunctions.TryGetValue(action, out response);
            if (!found)
            {
                throw new RadioException("No server function for action: " + action);
            }

            await response.Invoke(mySocket, jObject);
        }

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

            var sessionV1 = session.ToContract();
            await _sender.clientSessionReady(sessionV1, user.ToContract(), socket);
            await _sender.clientUpdateUsersList(sessionV1.Users, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task AddMediaToSession(MySocket socket, MediaV1 media)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.AddMediaToSessionAsync(media.ToModel(), sessionId);
            await _sender.clientUpdateQueue(updatedSession.ToContract().Queue, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task DeleteMediaFromSession(MySocket socket, int mediaId)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.RemoveMediaFromSessionAsync(sessionId, mediaId);
            await _sender.clientUpdateQueue(updatedSession.ToContract().Queue, _myContext.GetSocketsInSession(sessionId));
        }

        // TODO: don't use whole session
        public async Task SaveUserNameChange(MySocket socket, int userId, string newName)
        {
            await _db.UpdateUserNameAsync(userId, newName);
            var sessionId = socket.SessionId;
            var session = _db.GetSession(sessionId);
            await _sender.clientUpdateUsersList(session.ToContract().Users, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task ChatMessage(MySocket socket, string userName, string chatMessage)
        {
            await _sender.clientChatMessage(chatMessage, userName, _myContext.GetSocketsInSession(socket.SessionId));
        }

        public async Task RequestSyncWithUser(MySocket socket, int userIdRequestee)
        {
            var userIdRequestor = socket.UserId;
            var socketRequestee = _myContext.GetSocketForUser(socket.SessionId, userIdRequestee);
            await _sender.clientRequestUserState(userIdRequestor, socketRequestee);
        }

        public async Task ProvideSyncToUser(MySocket socket, int userIdRequestor, UserStateV1 userState)
        {
            var socketToSendTo = _myContext.GetSocketForUser(socket.SessionId, userIdRequestor);
            await _sender.clientProvideUserState(userState, socketToSendTo);
        }

        public async Task Search(MySocket socket, string query, int page)
        {
            var searchResults = await _searcher.searchPodcasts(query, page);
            await _sender.clientSearchResults(searchResults, socket);
        }

        private static MethodInfo GetMethodInfo<MessageReceiver>(Expression<Action<MessageReceiver>> expression)
        {
            var member = expression.Body as MethodCallExpression;

            if (member != null)
                return member.Method;

            throw new ArgumentException("Expression is not a method", "expression");
        }

    }
}

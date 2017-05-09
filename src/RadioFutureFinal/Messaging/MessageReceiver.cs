using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Errors;
using RadioFutureFinal.Models;
using RadioFutureFinal.External;
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
            var joinResult = await _myContext.TempUserJoinSession(socket, sessionName);
            var session = joinResult.Session;
            var sessionV1 = session.ToContract();
            await _sender.clientSessionReady(sessionV1, joinResult.User.ToContract(), socket);
            await _sender.clientUpdateUsersList(sessionV1.Users, 
                _myContext.GetSocketsInSession(session.SessionID));
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

        public async Task FbLogin(MySocket socket, int oldUserId, long fbUserId)
        {
            var result = await _myContext.SwitchUserInSession(socket, oldUserId, fbUserId);
            var user = result.User;
            await _sender.clientUserLoggedIn(user.MyUserId, user.Name, socket);
            await _sender.clientUpdateUsersList(result.Session.ToContract().Users,
                        _myContext.GetSocketsInSession(socket.SessionId));
        }

        public async Task SaveUserNameChange(MySocket socket, int userId, string newName)
        {
            await _db.UpdateUserNameAsync(userId, newName);
            await _sender.clientsUpdateUserName(userId, newName, _myContext.GetSocketsInSession(socket.SessionId));
        }

    }
}

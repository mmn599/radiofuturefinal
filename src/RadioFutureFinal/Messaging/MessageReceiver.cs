using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Errors;
using RadioFutureFinal.Models;
using RadioFutureFinal.Search;
using System;
using System.Collections.Generic;
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
        
        private delegate Task ResponseFunction(MySocket socket, string json);
        private delegate Task ServerAction<T>(MySocket socket, T msg);

        private async Task Handle<T>(MySocket socket, string json, ServerAction<T> func)
        {
            var msg = JsonConvert.DeserializeObject<T>(json);
            await func.Invoke(socket, msg);
        }

        public MessageReceiver(IDbRepository db, IMyContext myContext, MessageSenderFactory senderFactory, Searcher searcher)
        {
            _myContext = myContext;
            _db = db;
            _sender = senderFactory.Create(_myContext.SocketDisconnected);
            _searcher = searcher;
            _responseFunctions = new Dictionary<string, ResponseFunction>()
            {
                { "JoinSession", async (socket, json) => { await Handle<MsgJoinSession>(socket, json, JoinSession); }},
                { "AddMediaToSession", async (socket, json) => { await Handle<MsgAddMediaToSession>(socket, json, AddMediaToSession); }},
                { "DeleteMediaFromSession", async (socket, json) => { await Handle<MsgDeleteMediaFromSession>(socket, json, DeleteMediaFromSession); }},
                { "SaveUserNameChange", async (socket, json) => { await Handle<MsgSaveUserNameChange>(socket, json, SaveUserNameChange); }},
                { "ChatMessage", async (socket, json) => { await Handle<MsgChatMessage>(socket, json, ChatMessage); }},
                { "RequestSyncWithUser", async (socket, json) => { await Handle<MsgRequestSyncWithUser>(socket, json, RequestSyncWithUser); }},
                { "ProvideSyncToUser", async (socket, json) => { await Handle<MsgProvideSyncToUser>(socket, json, ProvideSyncToUser); }},
                { "Search", async (socket, json) => { await Handle<MsgSearch>(socket, json, Search); }},
            };
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

            await response.Invoke(mySocket, json);
        }

        // TODO: significant bug where additional session is created with same name if two request are made in similar times. I may have fixed it
        // TODO: WsMessage shouldn't be same for every message
        public async Task JoinSession(MySocket socket, MsgJoinSession msg)
        {
            Session session = null;
            bool sessionFound = _db.GetSessionByName(msg.sessionName, out session);
            if(!sessionFound)
            {
                session = await _db.CreateSessionAsync(msg.sessionName);
            }
            var userName = "Anonymous";
            var user = await _db.AddNewUserToSessionAsync(userName, session);

            var sessionId = session.SessionID;

            _myContext.SocketJoinSession(socket, sessionId, user.MyUserId);

            var sessionV1 = session.ToContract();
            await _sender.clientSessionReady(sessionV1, user.ToContract(), socket);
            await _sender.clientUpdateUsersList(sessionV1.Users, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task AddMediaToSession(MySocket socket, MsgAddMediaToSession msg)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.AddMediaToSessionAsync(msg.media.ToModel(), sessionId);
            await _sender.clientUpdateQueue(updatedSession.ToContract().Queue, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task DeleteMediaFromSession(MySocket socket, MsgDeleteMediaFromSession msg)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.RemoveMediaAsync(sessionId, msg.mediaId);
            await _sender.clientUpdateQueue(updatedSession.ToContract().Queue, _myContext.GetSocketsInSession(sessionId));
        }

        // TODO: don't use whole session
        public async Task SaveUserNameChange(MySocket socket, MsgSaveUserNameChange msg)
        {
            await _db.UpdateUserNameAsync(msg.userId, msg.newName);
            var sessionId = socket.SessionId;
            var session = _db.GetSession(sessionId);
            await _sender.clientUpdateUsersList(session.ToContract().Users, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task ChatMessage(MySocket socket, MsgChatMessage msg)
        {
            await _sender.clientChatMessage(msg.chatMessage, msg.userName, _myContext.GetSocketsInSession(socket.SessionId));
        }

        public async Task RequestSyncWithUser(MySocket socket, MsgRequestSyncWithUser msg)
        {
            var userIdRequestor = socket.UserId;
            var socketRequestee = _myContext.GetSocketForUser(socket.SessionId, msg.userIdRequestee);
            await _sender.clientRequestUserState(userIdRequestor, socketRequestee);
        }

        public async Task ProvideSyncToUser(MySocket socket, MsgProvideSyncToUser msg)
        {
            var socketToSendTo = _myContext.GetSocketForUser(socket.SessionId, msg.userIdRequestor);
            await _sender.clientProvideUserState(msg.userState, socketToSendTo);
        }

        public async Task Search(MySocket socket, MsgSearch msg)
        {
            var searchResults = await _searcher.searchPodcasts(msg.query, msg.page);
            await _sender.clientSearchResults(searchResults, socket);
        }

    }
}

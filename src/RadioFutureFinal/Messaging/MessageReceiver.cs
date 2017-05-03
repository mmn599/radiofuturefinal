using Newtonsoft.Json;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Errors;
using RadioFutureFinal.Models;
using RadioFutureFinal.Search;
using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MessageReceiver : IMessageReceiver
    {
        IMyContext _myContext;
        IDbRepository _db;
        IMessageSender _sender;
        Searcher _searcher;
        Dictionary<string, ResponseFunction> _responses;

        public delegate Task ResponseFunction(WsMessage message, MySocket socket);

        public MessageReceiver(IDbRepository db, IMyContext myContext, MessageSenderFactory senderFactory, Searcher searcher)
        {
            _myContext = myContext;
            _db = db;
            _sender = senderFactory.Create(_myContext.SocketDisconnected);
            _searcher = searcher;

            // TODO: there's a better spot for this
            _responses = new Dictionary<string, ResponseFunction>()
            {
                { "UserJoinSession", JoinSession },
                { "AddMediaToSession", AddMediaToSession },
                { "DeleteMediaFromSession", DeleteMediaFromSession },
                { "SaveUserNameChange", SaveUserNameChange },
                { "ChatMessage", ChatMessage },
                { "RequestSyncWithUser", RequestSyncWithUser },
                { "ProvideSyncToUser", ProvideSyncToUser },
                { "Search", Search }
            };
        }

        public async Task HandleMessage(WsMessage wsMessage, WebSocket senderSocket)
        {
            MySocket mySocket = _myContext.GetMySocket(senderSocket);
            ResponseFunction responseFunction;
            var validAction = _responses.TryGetValue(wsMessage.Action, out responseFunction);
            if (validAction)
            {
                await responseFunction.Invoke(wsMessage, mySocket);
            }
            else
            {
                // TODO: real exception
                throw new RadioException();
            }
        }

        // TODO: significant bug where additional session is created with same name if two request are made in similar times. I may have fixed it
        // TODO: WsMessage shouldn't be same for every message
        public async Task JoinSession(WsMessage message, MySocket socket)
        {
            var sessionName = message.Session.Name;
            Session session = null;
            bool sessionFound = _db.GetSessionByName(sessionName, out session);
            if(!sessionFound)
            {
                session = await _db.CreateSessionAsync(sessionName);
            }
            var userName = message.User.Name;
            var user = await _db.AddNewUserToSessionAsync(userName, session);

            var sessionId = session.SessionID;

            _myContext.SocketJoinSession(socket, sessionId, user.MyUserId);

            await _sender.ClientSessionReady(socket, session, user);
            await _sender.ClientsUpdateSessionUsers(session, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task AddMediaToSession(WsMessage message, MySocket socket)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.AddMediaToSessionAsync(message.Media.ToModel(), sessionId);
            await _sender.ClientsUpdateSessionQueue(updatedSession, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task DeleteMediaFromSession(WsMessage message, MySocket socket)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.RemoveMediaAsync(sessionId, message.Media.Id);
            await _sender.ClientsUpdateSessionQueue(updatedSession, _myContext.GetSocketsInSession(sessionId));
        }

        // TODO: don't use whole session
        public async Task SaveUserNameChange(WsMessage message, MySocket socket)
        {
            var user = message.User;
            await _db.UpdateUserNameAsync(user.Id, user.Name);
            var sessionId = socket.SessionId;
            var session = _db.GetSession(sessionId);
            await _sender.ClientsUpdateSessionUsers(session, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task ChatMessage(WsMessage message, MySocket socket)
        {
            await _sender.ClientsSendChatMessage(message, _myContext.GetSocketsInSession(socket.SessionId));
        }

        public async Task RequestSyncWithUser(WsMessage message, MySocket socket)
        {
            var userIdRequestor = socket.UserId;
            var userIdRequestee = message.User.Id;
            var socketRequestee = _myContext.GetSocketIdForUser(socket.SessionId, userIdRequestee);
            await _sender.ClientRequestUserState(userIdRequestor, userIdRequestee, socketRequestee);
        }

        public async Task ProvideSyncToUser(WsMessage message, MySocket socket)
        {
            // TODO: user ID represents the user to send to. this is stupid. WsMessage needs to be split up.
            var userIdToSendTo = message.User.Id; // <--- dumb!
            var socketToSendTo = _myContext.GetSocketIdForUser(socket.SessionId, userIdToSendTo);
            await _sender.ClientProvideUserState(message.User, socketToSendTo);
        }

        public async Task Search(WsMessage message, MySocket socket)
        {
            var query = message.ChatMessage;
            var searchResults = await _searcher.searchPodcasts(query);
            await _sender.ClientSearchResults(socket, searchResults);
        }

    }
}

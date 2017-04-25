using Newtonsoft.Json;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public class WebSocketReceiver : IWebSocketReceiver
    {
        IMyContext _myContext;
        IDbRepository _db;
        IWebSocketSender _wsSender;
        Dictionary<string, ResponseFunction> _responses;
        public delegate Task ResponseFunction(WsMessage message, MySocket socket);

        public WebSocketReceiver(IDbRepository db, IMyContext myContext, WebSocketSenderFactory wsSenderFactory)
        {
            _myContext = myContext;
            _db = db;
            _wsSender = wsSenderFactory.Create(myContext.RemoveSocketFromContext);

            // TODO: probably put this somehwere else?
            _responses = new Dictionary<string, ResponseFunction>()
            {
                { "UserJoinSession", JoinSession },
                { "AddMediaToSession", AddMediaToSession },
                { "DeleteMediaFromSession", DeleteMediaFromSession },
                { "SaveUserNameChange", SaveUserNameChange },
                { "ChatMessage", ChatMessage },
                { "RequestSyncWithUser", RequestSyncWithUser },
                { "ProvideSyncToUser", ProvideSyncToUser }
            };
        }

        public void OnConnected(WebSocket socket)
        {
            _myContext.SocketConnected(socket);
        }

        public async Task OnDisconnected(WebSocket socket)
        {
            await _myContext.RemoveSocketFromContext(socket);
        }

        // TODO: how neccesary is this being async?
        public async Task ReceiveAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer)
        {
            var strMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
            WsMessage wsMessage = JsonConvert.DeserializeObject<WsMessage>(strMessage);
            MySocket mySocket = _myContext.GetMySocket(socket);

            ResponseFunction responseFunction;
            var validAction = _responses.TryGetValue(wsMessage.Action, out responseFunction);
            if (validAction)
            {
                await responseFunction.Invoke(wsMessage, mySocket);
            }
            else
            {
                // TODO: real exception
                throw new Exception();
            }

        }

        // TODO: significant bug where additional session is created with same name if two request are made in similar times
        // TODO: WsMessage shouldn't be same for every message
        private async Task JoinSession(WsMessage message, MySocket socket)
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

            await _wsSender.ClientSessionReady(socket, session, user);
            await _wsSender.ClientsUpdateSessionUsers(session, _myContext.GetSocketsInSession(sessionId));
        }

        private async Task AddMediaToSession(WsMessage message, MySocket socket)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.AddMediaToSessionAsync(message.Media.ToModel(), sessionId);
            await _wsSender.ClientsUpdateSessionQueue(updatedSession, _myContext.GetSocketsInSession(sessionId));
        }

        private async Task DeleteMediaFromSession(WsMessage message, MySocket socket)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.RemoveMediaAsync(sessionId, message.Media.Id);
            await _wsSender.ClientsUpdateSessionQueue(updatedSession, _myContext.GetSocketsInSession(sessionId));
        }

        // TODO: don't use whole session
        private async Task SaveUserNameChange(WsMessage message, MySocket socket)
        {
            var user = message.User;
            await _db.UpdateUserNameAsync(user.Id, user.Name);
            var sessionId = socket.SessionId;
            var session = _db.GetSession(sessionId);
            await _wsSender.ClientsUpdateSessionUsers(session, _myContext.GetSocketsInSession(sessionId));
        }

        private async Task ChatMessage(WsMessage message, MySocket socket)
        {
            await _wsSender.ClientsSendChatMessage(message, _myContext.GetSocketsInSession(socket.SessionId));
        }

        private async Task RequestSyncWithUser(WsMessage message, MySocket socket)
        {
            var userIdRequestor = socket.UserId;
            var userIdRequestee = message.User.Id;
            var socketRequestee = _myContext.GetSocketIdForUser(socket.SessionId, userIdRequestee);
            await _wsSender.ClientRequestUserState(userIdRequestor, userIdRequestee, socketRequestee);
        }

        private async Task ProvideSyncToUser(WsMessage message, MySocket socket)
        {
            // TODO: user ID represents the user to send to. this is stupid. WsMessage needs to be split up.
            var userIdToSendTo = message.User.Id; // <--- dumb!
            var socketToSendTo = _myContext.GetSocketIdForUser(socket.SessionId, userIdToSendTo);
            await _wsSender.ClientProvideUserState(message.User, socketToSendTo);
        }
    }
}

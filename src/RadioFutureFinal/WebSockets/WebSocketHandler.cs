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
    public class WebSocketHandler
    {
        protected MyContext _myContext { get; set; }
        protected IDbRepository _db { get; set; }

        public WebSocketHandler(IDbRepository db, MyContext myContext)
        {
            _myContext = myContext;
            _db = db;
        }

        public void OnConnected(WebSocket socket)
        {
            _myContext.SocketConnected(socket);
        }

        public async Task OnDisconnected(WebSocket socket)
        {
            var mySocket = _myContext.GetMySocket(socket);
            var sessionId = mySocket.SessionId;
            var userId = mySocket.UserId;

            _myContext.SocketDisconnected(socket);

            var updatedSession = await _db.RemoveUserFromSessionAsync(sessionId, userId);
            var remainingSockets = GetSocketsInSession(sessionId);
            if(remainingSockets.Count > 0)
            {
                await ClientMessages.ClientsUpdateSessionUsers(updatedSession, remainingSockets);
            }
        }

        // TODO: how neccesary is this being async?
        public async Task ReceiveAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer)
        {
            var strMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
            WsMessage wsMessage = null;
            try
            {
                wsMessage = JsonConvert.DeserializeObject<WsMessage>(strMessage);
            }
            catch(Exception e)
            {
                var msg = e.Message;
                // TODO: Throw exception
                return;
            }

            MySocket mySocket = _myContext.GetMySocket(socket);
            // TODO: better action dictionary
            if(wsMessage.Action.Equals("UserJoinSession", StringComparison.CurrentCultureIgnoreCase))
            {
                await JoinSession(wsMessage, mySocket);
            }
            else if(wsMessage.Action.Equals("AddMediaToSession", StringComparison.CurrentCultureIgnoreCase))
            {
                await AddMediaToSession(wsMessage, mySocket);
            }
            else if(wsMessage.Action.Equals("DeleteMediaFromSession", StringComparison.CurrentCultureIgnoreCase))
            {
                await DeleteMediaFromSession(wsMessage, mySocket);
            }
            else if(wsMessage.Action.Equals("SaveUserVideoState", StringComparison.CurrentCultureIgnoreCase))
            {
                await SaveUserVideoState(wsMessage, mySocket);
            }
            else if(wsMessage.Action.Equals("SaveUserNameChange", StringComparison.CurrentCultureIgnoreCase))
            {
                await SaveUserNameChange(wsMessage, mySocket);
            }
            else if(wsMessage.Action.Equals("ChatMessage", StringComparison.CurrentCultureIgnoreCase))
            {
                await ChatMessage(wsMessage, mySocket);
            }
            else
            {
                // TODO: exception handling
            }
        }

        private List<MySocket> GetSocketsInSession(int sessionId)
        {
            List<MySocket> socketsInSession;
            var found = _myContext.ActiveSessions.TryGetValue(sessionId, out socketsInSession);
            if(!found)
            {
                // TODO: maybe exception?
                return new List<MySocket>();
            }
            return socketsInSession;
        }

        // TODO: significant bug where additional session is created with same name if two request are made in similar times
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

            await ClientMessages.ClientSessionReady(socket, session, user);
            await ClientMessages.ClientsUpdateSessionUsers(session, GetSocketsInSession(sessionId));
        }

        private async Task AddMediaToSession(WsMessage message, MySocket socket)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.AddMediaToSessionAsync(message.Media.ToModel(), sessionId);
            await ClientMessages.ClientsUpdateSessionQueue(updatedSession, GetSocketsInSession(sessionId));
        }

        private async Task DeleteMediaFromSession(WsMessage message, MySocket socket)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.RemoveMediaAsync(sessionId, message.Media.Id);
            await ClientMessages.ClientsUpdateSessionQueue(updatedSession, GetSocketsInSession(sessionId));
        }
        private async Task SaveUserVideoState(WsMessage message, MySocket socket)
        {
            var user = message.User;
            await _db.UpdateUserVideoState(user.Id, user.YTPlayerState, user.VideoTime, user.QueuePosition);
        }

        // TODO: don't use whole session
        private async Task SaveUserNameChange(WsMessage message, MySocket socket)
        {
            var user = message.User;
            await _db.UpdateUserNameAsync(user.Id, user.Name);
            var sessionId = socket.SessionId;
            var session = _db.GetSession(sessionId);
            await ClientMessages.ClientsUpdateSessionUsers(session, GetSocketsInSession(sessionId));
        }

        private async Task ChatMessage(WsMessage message, MySocket socket)
        {
            await ClientMessages.ClientsSendChatMessage(message, GetSocketsInSession(socket.SessionId));
        }
    }
}

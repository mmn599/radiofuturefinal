using Newtonsoft.Json;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public class WebSocketSender : IWebSocketSender
    {
        Func<WebSocket, Task> _onBadSend;

        public WebSocketSender(Func<WebSocket, Task> onBadSend)
        {
            _onBadSend = onBadSend;
        }
            
        private async Task<SendResult> SendMessageAsync(WebSocket socket, WsMessage wsMessage)
        {
            var success = true;

            if (socket.State != WebSocketState.Open)
            {
                success = false;
            }

            string message = JsonConvert.SerializeObject(wsMessage);

            try
            {
                await socket.SendAsync(buffer: new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(message),
                                                                      offset: 0,
                                                                      count: message.Length),
                                       messageType: WebSocketMessageType.Text,
                                       endOfMessage: true,
                                       cancellationToken: CancellationToken.None);
            }
            catch(WebSocketException e)
            {
                // TODO: indicates the websocket closed without doing the handshake. this happens on mobile. find a more robust way to fix this.
                success = false;
            }

            if(!success)
            {
                await _onBadSend.Invoke(socket);
                return SendResult.CreateFailure(socket);
            }

            return SendResult.CreateSuccess();
        }

        private async Task<List<SendResult>> SendMessageToSessionAsync(WsMessage message, List<MySocket> socketsInSession)
        {
            var sendResults = new List<SendResult>();
            foreach(var socket in socketsInSession)
            {
                var sendResult = await SendMessageAsync(socket.WebSocket, message);
                sendResults.Add(sendResult);
            }

            return sendResults;
        }

        public async Task<SendResult> ClientSessionReady(MySocket socket, Session session, MyUser user)
        {
            // TODO: How can I make sure this is somewhat updated properly?
            var wsMessage = new WsMessage();
            wsMessage.Action = "sessionReady";
            wsMessage.Session = session.ToContract(); 
            wsMessage.User = user.ToContract();

            return await SendMessageAsync(socket.WebSocket, wsMessage);
        }

        public async Task<SendResult> ClientRequestUserState(int userIdRequestor, int userIdRequestee, MySocket userSocket)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = "requestUserState";
            wsMessage.User = new MyUserV1();
            wsMessage.User.Id = userIdRequestor;

            return await SendMessageAsync(userSocket.WebSocket, wsMessage);
        }

        public async Task<SendResult> ClientProvideUserState(MyUserV1 userInfo, MySocket userToSendTo)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = "provideUserState";
            wsMessage.User = userInfo;
            wsMessage.User.Id = -1; // TODO: this is because of crappy message system

            return await SendMessageAsync(userToSendTo.WebSocket, wsMessage);
        }

        private async Task<List<SendResult>> ClientsUpdateSession(Session session, string action, List<MySocket> socketsInSession)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = action;
            wsMessage.Session = session.ToContract();
            return await SendMessageToSessionAsync(wsMessage, socketsInSession);
        }

        //TODO: probably shouldn't be sending full session for user and queue updates
        public async Task<List<SendResult>> ClientsUpdateSessionUsers(Session session, List<MySocket> socketsInSession)
        {
            return await ClientsUpdateSession(session, "updateUsersList", socketsInSession);
        }

        public async Task<List<SendResult>> ClientsUpdateSessionQueue(Session session, List<MySocket> socketsInSession)
        {
            return await ClientsUpdateSession(session, "updateQueue", socketsInSession);
        }

        // TODO: don't use full WsMessage
        public async Task<List<SendResult>> ClientsSendChatMessage(WsMessage message, List<MySocket> socketsInSession)
        {
            return await SendMessageToSessionAsync(message, socketsInSession);
        }
    }
}

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
            
        // TODO: find a better way to deal with removing websockets if they are closed
        private async Task<bool> SendMessageAsync(WebSocket socket, WsMessage wsMessage)
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
                await _onBadSend?.Invoke(socket);
            }

            return success;
        }

        private async Task<SendResult> SendMessageToSessionAsync(WsMessage message, List<MySocket> socketsInSession)
        {
            var faultySockets = new List<MySocket>();
            foreach(var socket in socketsInSession)
            {
                var success = await SendMessageAsync(socket.WebSocket, message);
                if(!success)
                {
                    faultySockets.Add(socket);
                }
            }

            if(faultySockets.Count == 0)
            {
                return SendResult.CreateSuccess();
            }
            else
            {
                return SendResult.CreateFailure(faultySockets);
            }
        }

        public async Task<SendResult> ClientSessionReady(MySocket socket, Session session, MyUser user)
        {
            // TODO: How can I make sure this is somewhat updated properly?
            var wsMessage = new WsMessage();
            wsMessage.Action = "sessionReady";
            wsMessage.Session = session.ToContract(); 
            wsMessage.User = user.ToContract();

            var success = await SendMessageAsync(socket.WebSocket, wsMessage);
            if(success)
            {
                return SendResult.CreateSuccess();
            }
            else
            {
                return SendResult.CreateFailure(new List<MySocket>() { socket });
            }
        }

        private async Task<SendResult> ClientsUpdateSession(Session session, string action, List<MySocket> socketsInSession)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = action;
            wsMessage.Session = session.ToContract();
            var sendResult = await SendMessageToSessionAsync(wsMessage, socketsInSession);
            return sendResult;
        }

        //TODO: probably shouldn't be sending full session for user and queue updates
        public async Task<SendResult> ClientsUpdateSessionUsers(Session session, List<MySocket> socketsInSession)
        {
            return await ClientsUpdateSession(session, "updateUsersList", socketsInSession);
        }

        public async Task<SendResult> ClientsUpdateSessionQueue(Session session, List<MySocket> socketsInSession)
        {
            return await ClientsUpdateSession(session, "updateQueue", socketsInSession);
        }

        // TODO: don't use full WsMessage
        public async Task<SendResult> ClientsSendChatMessage(WsMessage message, List<MySocket> socketsInSession)
        {
            return await SendMessageToSessionAsync(message, socketsInSession);
        }
    }
}

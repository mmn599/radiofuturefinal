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
    public static class WebSocketSender
    {

        // TODO: find a better way to deal with removing websockets if they are closed
        private static async Task<bool> SendMessageAsync(WebSocket socket, WsMessage wsMessage)
        {
            if (socket.State != WebSocketState.Open)
                return false;

            string message = JsonConvert.SerializeObject(wsMessage);

            try
            {
                await socket.SendAsync(buffer: new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(message),
                                                                      offset: 0,
                                                                      count: message.Length),
                                       messageType: WebSocketMessageType.Text,
                                       endOfMessage: true,
                                       cancellationToken: CancellationToken.None);
                return true;
            }
            catch(WebSocketException e)
            {
                // TODO: indicates the websocket closed without doing the handshake. this happens on mobile. find a more robust way to fix this.
                return false;
            }
        }

        private static async Task<List<MySocket>> SendMessageToSessionAsync(WsMessage message, List<MySocket> socketsInSession)
        {
            var errorSockets = new List<MySocket>();
            foreach(var socket in socketsInSession)
            {
                var success = await SendMessageAsync(socket.WebSocket, message);
                if(!success)
                {
                    errorSockets.Add(socket);
                }
            }
            return errorSockets;
        }

        private static async Task<List<MySocket>> ClientsUpdateSession(Session session, string action, List<MySocket> socketsInSession)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = action;
            wsMessage.Session = session.ToContract();
            var errorSockets = await SendMessageToSessionAsync(wsMessage, socketsInSession);
            return errorSockets;
        }

        public static async Task<bool> ClientSessionReady(MySocket socket, Session session, MyUser user)
        {
            // TODO: How can I make sure this is somewhat updated properly?
            var wsMessage = new WsMessage();
            wsMessage.Action = "sessionReady";
            wsMessage.Session = session.ToContract(); 
            wsMessage.User = user.ToContract();

            var success = await SendMessageAsync(socket.WebSocket, wsMessage);
            return success;
        }

        //TODO: probably shouldn't be sending full session for user and queue updates
        public static async Task ClientsUpdateSessionUsers(Session session, List<MySocket> socketsInSession)
        {
            await ClientsUpdateSession(session, "updateUsersList", socketsInSession);
        }

        public static async Task ClientsUpdateSessionQueue(Session session, List<MySocket> socketsInSession)
        {
            await ClientsUpdateSession(session, "updateQueue", socketsInSession);
        }

        // TODO: don't use full WsMessage
        public static async Task ClientsSendChatMessage(WsMessage message, List<MySocket> socketsInSession)
        {
            await SendMessageToSessionAsync(message, socketsInSession);
        }
    }
}

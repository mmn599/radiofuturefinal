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
    public static class ClientMessages
    {
        // TODO: ensure only valid websockets are sent to

        public static async Task<bool> SendMessageAsync(WebSocket socket, WsMessage wsMessage)
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
            catch(Exception e)
            {
                return false;
            }
        }

        public static async Task SendMessageToSessionAsync(WsMessage message, List<MySocket> socketsInSession)
        {
            foreach(var socket in socketsInSession)
            {
                await SendMessageAsync(socket.WebSocket, message);
            }
        }

        public static async Task ClientSessionReady(MySocket socket, Session session, MyUser user)
        {
            // TODO: How can I make sure this is somewhat updated properly?
            var wsMessage = new WsMessage();
            wsMessage.Action = "sessionReady";
            wsMessage.Session = session.ToContract(); 
            wsMessage.User = user.ToContract();

            await SendMessageAsync(socket.WebSocket, wsMessage);
        }

        //TODO: better way of keeping track of messages and shit. All these functions feel weird
        public static async Task ClientsUpdateSession(Session session, string action, List<MySocket> socketsInSession)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = action;
            wsMessage.Session = session.ToContract();
            await SendMessageToSessionAsync(wsMessage, socketsInSession);
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

    }
}

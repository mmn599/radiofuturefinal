using Newtonsoft.Json;
using RadioFutureFinal.Contracts;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MessageSenderBase : IMessageSenderBase
    {
        // TODO: there's probably a better way to avoid circular dependency
        Func<WebSocket, Task> _onDisconnect;

        public MessageSenderBase(Func<WebSocket, Task> onDisconnect)
        {
            _onDisconnect = onDisconnect;
        }

        public async Task<SendResult> SendMessageAsync(WebSocket socket, WsMessage wsMessage)
        {
            var success = true;

            if (socket.State != WebSocketState.Open)
            {
                success = false;
            }

            string message = JsonConvert.SerializeObject(wsMessage);

            if(socket.State == WebSocketState.Open)
            {
                try
                {
                    await socket.SendAsync(buffer: new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(message),
                                                                          offset: 0,
                                                                          count: message.Length),
                                           messageType: WebSocketMessageType.Text,
                                           endOfMessage: true,
                                           cancellationToken: CancellationToken.None);
                }
                catch(Exception e)
                {
                    // TODO: indicates the websocket closed without doing the handshake. this happens on mobile. find a more robust way to fix this.
                    success = false;
                }
            }

            if(!success)
            {
                await _onDisconnect(socket);
                return SendResult.CreateFailure(socket);
            }

            return SendResult.CreateSuccess();
        }

        public async Task<List<SendResult>> SendMessageToSessionAsync(WsMessage message, 
                ConcurrentDictionary<WebSocket, MySocket> socketsInSession)
        {
            var sendResults = new List<SendResult>();
            foreach(var kvPair in socketsInSession)
            {
                var socket = kvPair.Key;
                var sendResult = await SendMessageAsync(socket, message);
                sendResults.Add(sendResult);
            }

            return sendResults;
        }

    }
}

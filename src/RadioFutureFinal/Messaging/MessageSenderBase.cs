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

        private async Task<SendResult> SendMessageAsyncInternal(WebSocket socket, string message)
        {
            var success = true;

            if (socket.State != WebSocketState.Open)
            {
                success = false;
            }

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
                catch
                {
                    success = false;
                }
            }

            if(!success)
            {
                return SendResult.CreateFailure(socket);
            }

            return SendResult.CreateSuccess();
        }

        public async Task<SendResult> SendMessageAsync(MySocket socket, string message)
        {
            var sendResult = await SendMessageAsyncInternal(socket.WebSocket, message);
            if(!sendResult.Success)
            {
                await _onDisconnect.Invoke(sendResult.FaultySocket);
            }
            return sendResult;
        }

        public async Task<List<SendResult>> SendMessageToSessionAsync(IEnumerable<MySocket> socketsInSession, string message)
        {
            var sendResults = new List<SendResult>();
            foreach(var socket in socketsInSession)
            {
                var sendResult = await SendMessageAsyncInternal(socket.WebSocket, message);
                sendResults.Add(sendResult);
            }
            foreach(var sendResult in sendResults)
            {
                if(!sendResult.Success)
                {
                    await _onDisconnect.Invoke(sendResult.FaultySocket);
                }
            }
            return sendResults;
        }

    }
}

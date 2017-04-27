using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class WebSocketMiddleware
    {
        private readonly RequestDelegate _next;
        private IMessageReceiverBase _messageReceiveBase { get; set; }
        private IMyContext _myContext { get; set; }

        public WebSocketMiddleware(RequestDelegate next,
                                          IMessageReceiverBase receiver, IMyContext context)
        {
            _next = next;
            _messageReceiveBase = receiver;
            _myContext = context;
        }

        public async Task Invoke(HttpContext context)
        {
            if (!context.WebSockets.IsWebSocketRequest)
            {
                await _next.Invoke(context);
            }

            var socket = await context.WebSockets.AcceptWebSocketAsync();
            _myContext.SocketConnected(socket);

            await Receive(socket, async (result, buffer) =>
            {
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    await _messageReceiveBase.ReceiveMessageAsync(socket, result, buffer);
                    return;
                }

                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    await _myContext.SocketDisconnected(socket);
                    return;
                }
            });
        }

        private async Task Receive(WebSocket socket, Action<WebSocketReceiveResult, byte[]> handleMessage)
        {
            var buffer = new byte[1024 * 4];

            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(buffer: new ArraySegment<byte>(buffer),
                                                       cancellationToken: CancellationToken.None);

                handleMessage(result, buffer);
            }
        }
    }
}

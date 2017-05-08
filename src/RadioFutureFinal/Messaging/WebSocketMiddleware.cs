using Microsoft.AspNetCore.Http;
using RadioFutureFinal.Errors;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class WebSocketMiddleware
    {
        private readonly RequestDelegate _next;
        private IMessageReceiver _messageReceiver { get; set; }
        private IMyContext _myContext { get; set; }

        public WebSocketMiddleware(RequestDelegate next,
                                          IMessageReceiver receiver, IMyContext context)
        {
            _next = next;
            _messageReceiver = receiver;
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

            await Receive(socket, async (result, message) =>
            {
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    await _messageReceiver.HandleMessage(message, socket);
                    return;
                }

                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    await _myContext.SocketDisconnected(socket);
                    return;
                }
            });
        }

        private async Task Receive(WebSocket socket, Action<WebSocketReceiveResult, string> handleMessage)
        {

            while (socket.State == WebSocketState.Open)
            {
                var buffer = new ArraySegment<byte>(new byte[1024 * 8]);
                WebSocketReceiveResult result = null;

                using (var ms = new MemoryStream())
                {
                    do
                    {
                        result = await socket.ReceiveAsync(buffer, CancellationToken.None);
                        ms.Write(buffer.Array, buffer.Offset, result.Count);
                    }
                    while (!result.EndOfMessage);

                    ms.Seek(0, SeekOrigin.Begin);

                    using (var reader = new StreamReader(ms, Encoding.UTF8))
                    {
                        var message = reader.ReadToEnd();
                        handleMessage(result, message);
                    }
                }
            }
        }
    }
}

﻿using System.Net.WebSockets;
using System.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using RadioFutureFinal.DAL;

namespace RadioFutureFinal.WebSockets
{
    public class SocketHandler
    {
        public const int BufferSize = 4096;

        WebSocket _socket;
        IDbRepository _db;

        public SocketHandler(WebSocket socket, IDbRepository db)
        {
            _socket = socket;
            _db = db;
        }

        private async Task EchoLoop()
        {
            var buffer = new byte[BufferSize];
            var seg = new ArraySegment<byte>(buffer);

            while(_socket.State == WebSocketState.Open)
            {
                var incoming = await _socket.ReceiveAsync(seg, CancellationToken.None);
                var outgoing = new ArraySegment<byte>(buffer, 0, incoming.Count);
                await _socket.SendAsync(outgoing, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }

        private static async Task Acceptor(HttpContext hc, Func<Task> n)
        {
            if(!hc.WebSockets.IsWebSocketRequest)
            {
                return;
            }

            var socket = await hc.WebSockets.AcceptWebSocketAsync();
            var h = new SocketHandler(socket);
            await h.EchoLoop();
        }

        public static void Map(IApplicationBuilder app)
        {
            app.UseWebSockets();
            app.Use(SocketHandler.Acceptor);
        }
    }
}

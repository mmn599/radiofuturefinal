using RadioFutureFinal.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public class WebSocketHandler
    {
        protected WebSocketConnectionManager _wsConnectionManager { get; set; }
        protected IDbRepository _db { get; set; }

        public WebSocketHandler(IDbRepository db, WebSocketConnectionManager webSocketConnectionManager)
        {
            _wsConnectionManager = webSocketConnectionManager;
            _db = db;
        }

        public void OnConnected(WebSocket socket)
        {
            _wsConnectionManager.AddSocket(socket);
        }

        public virtual async Task OnDisconnected(WebSocket socket)
        {
            await _wsConnectionManager.RemoveSocket(socket);
        }

        public async Task SendMessageAsync(WebSocket socket, string message)
        {
            if (socket.State != WebSocketState.Open)
                return;

            await socket.SendAsync(buffer: new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(message),
                                                                  offset: 0,
                                                                  count: message.Length),
                                   messageType: WebSocketMessageType.Text,
                                   endOfMessage: true,
                                   cancellationToken: CancellationToken.None);
        }

        public async Task SendMessageToAllAsync(string message)
        {
            foreach (var pair in _wsConnectionManager.GetAll())
            {
                await SendMessageAsync(pair.Value.WebSocket, message);
            }
        }

        public async Task SendMessageToSession(string message, int sessionId)
        {
            foreach(var socket in _wsConnectionManager.GetSocketsInSession(sessionId))
            {
                await SendMessageAsync(socket.WebSocket, message);
            }
        }

        public async Task ReceiveAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer)
        {
            var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
            await SendMessageToAllAsync(message);
        }
    }
}

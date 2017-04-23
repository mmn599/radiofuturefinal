using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public interface IWebSocketReceiver
    {
        void OnConnected(WebSocket socket);
        Task OnDisconnected(WebSocket socket);
        Task ReceiveAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer);
    }
}

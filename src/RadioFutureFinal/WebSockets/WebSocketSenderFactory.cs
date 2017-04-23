using System;
using System.Net.WebSockets;
using System.Threading.Tasks;
using static RadioFutureFinal.WebSockets.WebSocketSender;

namespace RadioFutureFinal.WebSockets
{
    public class WebSocketSenderFactory
    {
        // TODO: make this function default
        public WebSocketSender Create(Func<WebSocket, Task> onBadSend)
        {
            return new WebSocketSender(onBadSend);
        }
    }
}

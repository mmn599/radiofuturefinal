using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IMessageReceiver
    {
        Task HandleMessage(string json, WebSocket senderSocket);
    }
}

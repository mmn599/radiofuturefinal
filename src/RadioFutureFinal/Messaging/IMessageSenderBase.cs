using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IMessageSenderBase
    {
        Task<SendResult> SendMessageAsync(WebSocket socket, WsMessage wsMessage);
        Task<List<SendResult>> SendMessageToSessionAsync(WsMessage message, List<MySocket> socketsInSession);
    }
}

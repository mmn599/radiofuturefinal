using System;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MessageSenderFactory
    {
        public IMessageSender Create(Func<WebSocket, Task> onDisconnect)
        {
            var messageSenderBase = new MessageSenderBase(onDisconnect);
            var messageSender = new MessageSender(messageSenderBase);
            return messageSender;
        }

    }
}

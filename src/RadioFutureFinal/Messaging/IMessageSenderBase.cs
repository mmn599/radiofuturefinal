using System.Collections.Generic;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IMessageSenderBase
    {
        Task<SendResult> SendMessageAsync(MySocket socket, string message);
        Task<List<SendResult>> SendMessageToSessionAsync(IEnumerable<MySocket> socketsInSession, string message);
    }
}

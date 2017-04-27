using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IMessageReceiverBase
    {
        Task ReceiveMessageAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer);
    }
}

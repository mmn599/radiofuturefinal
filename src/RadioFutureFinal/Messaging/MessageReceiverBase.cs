using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;
using System.Reflection;
using Newtonsoft.Json.Linq;

namespace RadioFutureFinal.Messaging
{
    public class MessageReceiverBase : IMessageReceiverBase
    {
        IMessageReceiver _messageReceiver;
        IMyContext _myContext;

        public MessageReceiverBase(IMessageReceiver messageReceiver, IMyContext myContext)
        {
            _messageReceiver = messageReceiver;
            _myContext = myContext;
        }

        public async Task ReceiveMessageAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer)
        {
            var strMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
            await _messageReceiver.HandleMessage(strMessage, socket);
        }

    }
}

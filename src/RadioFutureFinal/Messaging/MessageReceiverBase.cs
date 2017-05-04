using Newtonsoft.Json;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.Errors;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MessageReceiverBase : IMessageReceiverBase
    {
        IMessageReceiver _messageReceiver;

        public MessageReceiverBase(IMessageReceiver messageReceiver)
        {
            _messageReceiver = messageReceiver;
        }

        public async Task ReceiveMessageAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer)
        {
            var strMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
            try
            {
                var json = JsonConvert.DeserializeObject(strMessage);
                await _messageReceiver.HandleMessage(json, socket);
            }
            catch(JsonSerializationException e)
            {
                throw new RadioException(strMessage);
            }
        }
    }
}

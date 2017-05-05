using Newtonsoft.Json;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.Errors;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;
using System.Reflection;

namespace RadioFutureFinal.Messaging
{
    public class MessageReceiverBase : IMessageReceiverBase
    {
        IActionsServer _messageReceiver;
        IMyContext _myContext;

        public MessageReceiverBase(IActionsServer messageReceiver, IMyContext myContext)
        {
            _messageReceiver = messageReceiver;
            _myContext = myContext;
        }

        public async Task ReceiveMessageAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer)
        {
            var strMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
            try
            {
                var json = JsonConvert.DeserializeObject(strMessage);
                await _handleMessage(json, socket);
            }
            catch(JsonSerializationException e)
            {
                throw new RadioException(strMessage);
            }
        }

        private async Task _handleMessage(dynamic json, WebSocket senderSocket)
        {
            string action = Convert.ToString(json.action);

            if(string.IsNullOrEmpty(action))
            {
                throw new RadioException("No action in message.");
            }

            var serverActionType = _messageReceiver.GetType();
            var methodInfo = serverActionType.GetMethod(action);
            var methodParameters = methodInfo.GetParameters();
            
            object[] arguments = new object[methodParameters.Length];
            for(int i=0; i<arguments.Length; i++)
            {
                var parameter = methodParameters[i]; 
                var paramName = parameter.Name;
                var paramType = parameter.GetType();
                object paramVal;
                if(paramType.Equals(typeof(MySocket)))
                {
                    paramVal = _myContext.GetMySocket(senderSocket); 
                }
                else
                {
                    paramVal = json.GetType().GetProperty(paramName).GetValue(json, null);
                    if(paramVal == null)
                    {
                        throw new RadioException("Message was missing: " + paramName + " parameter.");
                    }
                }
                arguments[i] = paramVal;
            }

            await (Task) methodInfo.Invoke(this, arguments);
        }
    }
}

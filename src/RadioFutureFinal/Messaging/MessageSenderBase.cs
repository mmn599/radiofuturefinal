using Newtonsoft.Json;
using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MessageSenderBase : IMessageSenderBase
    {

        IMyContext _myContext;

        public MessageSenderBase(IMyContext myContext)
        {
            _myContext = myContext;
        }

        public async Task<SendResult> SendMessageAsync(WebSocket socket, WsMessage wsMessage)
        {
            var success = true;

            if (socket.State != WebSocketState.Open)
            {
                success = false;
            }

            string message = JsonConvert.SerializeObject(wsMessage);

            try
            {
                await socket.SendAsync(buffer: new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(message),
                                                                      offset: 0,
                                                                      count: message.Length),
                                       messageType: WebSocketMessageType.Text,
                                       endOfMessage: true,
                                       cancellationToken: CancellationToken.None);
            }
            catch(WebSocketException e)
            {
                // TODO: indicates the websocket closed without doing the handshake. this happens on mobile. find a more robust way to fix this.
                success = false;
            }

            if(!success)
            {
                await _myContext.SocketDisconnected(socket);
                return SendResult.CreateFailure(socket);
            }

            return SendResult.CreateSuccess();
        }

        public async Task<List<SendResult>> SendMessageToSessionAsync(WsMessage message, List<MySocket> socketsInSession)
        {
            var sendResults = new List<SendResult>();
            foreach(var socket in socketsInSession)
            {
                var sendResult = await SendMessageAsync(socket.WebSocket, message);
                sendResults.Add(sendResult);
            }

            return sendResults;
        }

    }
}

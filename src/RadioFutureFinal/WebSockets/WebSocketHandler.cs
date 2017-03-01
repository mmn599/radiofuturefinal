using Newtonsoft.Json;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public class WebSocketHandler
    {
        protected WebSocketConnectionManager _wsConnectionManager { get; set; }
        protected IDbRepository _db { get; set; }

        public WebSocketHandler(IDbRepository db, WebSocketConnectionManager webSocketConnectionManager)
        {
            _wsConnectionManager = webSocketConnectionManager;
            _db = db;
        }

        public void OnConnected(WebSocket socket)
        {
            _wsConnectionManager.AddSocket(socket);
        }

        public virtual async Task OnDisconnected(WebSocket socket)
        {
            await _wsConnectionManager.RemoveSocket(socket);
        }

        public async Task SendMessageAsync(WebSocket socket, WsMessage wsMessage)
        {
            if (socket.State != WebSocketState.Open)
                return;

            string message = JsonConvert.SerializeObject(wsMessage);

            await socket.SendAsync(buffer: new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(message),
                                                                  offset: 0,
                                                                  count: message.Length),
                                   messageType: WebSocketMessageType.Text,
                                   endOfMessage: true,
                                   cancellationToken: CancellationToken.None);
        }

        // TODO: how neccesary is this being async?
        public async Task ReceiveAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer)
        {
            var strMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
            WsMessage wsMessage = null;
            try
            {
                wsMessage = JsonConvert.DeserializeObject<WsMessage>(strMessage);
            }
            catch
            {
                // TODO: Throw exception
                var wsOutgoingMessage = new WsMessage();
                wsOutgoingMessage.Action = "myaction";
                await SendMessageAsync(socket, wsOutgoingMessage);
                return;
            }

            // TODO: smoother way to do this
            Action<WsMessage> action = null;
            if(wsMessage.Action == "JoinSession")
            {
                action = JoinSession;
            }
            else if(wsMessage.Action == "AddMediaToSession")
            {
                action = AddMediaToSession;
            }
            else if(wsMessage.Action == "DeleteMediaFromSession")
            {
                action = DeleteMediaFromSession;
            }
            else if(wsMessage.Action == "SaveUserVideoState")
            {
                action = SaveUserVideoState;
            }
            else if(wsMessage.Action == "SaveUserNameChange")
            {
                action = SaveUserNameChange;
            }
            else if(wsMessage.Action == "ChatMessage")
            {
                action = ChatMessage;
            }
            else if(wsMessage.Action == "SynchronizeSession")
            {
                action = SynchronizeSession;
            }
            else
            {
                // TODO: exception handling
            }

            // TODO: barely understand what I'm doing here
            await Task.Run(() => action);
        }

        public async Task SendMessageToAllAsync(WsMessage message)
        {
            foreach (var pair in _wsConnectionManager.GetAll())
            {
                await SendMessageAsync(pair.Value.WebSocket, message);
            }
        }

        public async Task SendMessageToSession(WsMessage message, int sessionId)
        {
            foreach(var socket in _wsConnectionManager.GetSocketsInSession(sessionId))
            {
                await SendMessageAsync(socket.WebSocket, message);
            }
        }

        private void JoinSession(WsMessage message)
        {
        }
        private void AddMediaToSession(WsMessage message)
        {
        }
        private void DeleteMediaFromSession(WsMessage message)
        {
        }
        private void SaveUserVideoState(WsMessage message)
        {
        }
        private void SaveUserNameChange(WsMessage message)
        {
        }
        private void ChatMessage(WsMessage message)
        {
        }
        private void SynchronizeSession(WsMessage message)
        {
        }

    }
}

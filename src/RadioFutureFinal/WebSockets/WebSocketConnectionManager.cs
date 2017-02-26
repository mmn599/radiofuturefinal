using RadioFutureFinal.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public class WebSocketConnectionManager
    {

        // TODO: This data structure could be way better
        private ConcurrentDictionary<string, MySocket> _sockets = new ConcurrentDictionary<string, MySocket>();
        // TODO: May run into threading issues
        private ConcurrentDictionary<int, List<MySocket>> _sessionSockets = new ConcurrentDictionary<int, List<MySocket>>();

        public MySocket GetSocketById(string id)
        {
            return _sockets.FirstOrDefault(p => p.Key == id).Value;
        }

        public IEnumerable<MySocket> GetSocketsInSession(int sessionId)
        {
            return _sessionSockets.FirstOrDefault(p => p.Key == sessionId).Value;
        }

        public ConcurrentDictionary<string, MySocket> GetAll()
        {
            return _sockets;
        }

        public string GetId(WebSocket socket)
        {
            return _sockets.FirstOrDefault(p => p.Value.WebSocket == socket).Key;
        }

        public void AddSocket(WebSocket socket)
        {
            var mySocket = new MySocket(socket);
            _sockets.TryAdd(CreateConnectionId(), mySocket);
        }

        public void SocketJoinSession(MySocket socket, int sessionId)
        {
            var sessionSockets = _sessionSockets.FirstOrDefault(p => p.Key == sessionId).Value;
            sessionSockets.Add(socket); 
        }

        public async Task RemoveSocket(WebSocket webSocket)
        {
            var socketId = GetId(webSocket);
            await RemoveSocket(socketId);
        }

        public async Task RemoveSocket(string id)
        {
            MySocket socket;
            _sockets.TryRemove(id, out socket);
            
            if(socket.InSession)
            {
                var sessionId = socket.SessionId;
                _sessionSockets.FirstOrDefault(p => p.Key == socket.SessionId).Value.Remove(socket);
            }

            await socket.WebSocket.CloseAsync(closeStatus: WebSocketCloseStatus.NormalClosure,
                                    statusDescription: "Closed by the WebSocketManager",
                                    cancellationToken: CancellationToken.None);
        }

        private string CreateConnectionId()
        {
            return Guid.NewGuid().ToString();
        }

    }
}
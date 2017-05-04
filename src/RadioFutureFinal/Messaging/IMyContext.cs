using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IMyContext
    {
        MySocket GetMySocket(WebSocket socket);
        MySocket GetSocketIdForUser(int sessionId, int userId);
        ConcurrentDictionary<WebSocket, MySocket> GetSocketsInSession(int sessionId);
        void SocketConnected(WebSocket socket);
        Task SocketDisconnected(WebSocket socket);
        void SocketJoinSession(MySocket socket, int sessionId, int userId);
    }
}

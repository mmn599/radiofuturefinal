using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public interface IMyContext
    {
        MySocket GetMySocket(WebSocket socket);
        MySocket GetSocketIdForUser(int sessionId, int userId);
        List<MySocket> GetSocketsInSession(int sessionId);
        void SocketConnected(WebSocket socket);
        void SocketJoinSession(MySocket socket, int sessionId, int userId);
        Task RemoveSocketFromContext(MySocket mySocket);
        Task RemoveSocketFromContext(WebSocket socket);
    }
}

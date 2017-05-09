using RadioFutureFinal.Models;
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
        MySocket GetSocketForUser(int sessionId, int userId);
        IEnumerable<MySocket> GetSocketsInSession(int sessionId);
        void SocketConnected(WebSocket socket);
        Task SocketDisconnected(WebSocket socket);
        Task<SessionJoinResult> TempUserJoinSession(MySocket socket, string sessionName);
        Task<SessionJoinResult> SwitchUserInSession(MySocket socket, int oldUserId, Guid fbUserId);
    }
}

using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MySocket
    {
        public WebSocket WebSocket { get; set; }
        public bool InSession { get { return _inSession; } }
        public int SessionId { get { return _sessionId; } }
        public int UserId { get; set; }

        bool _inSession;
        int _sessionId;

        public MySocket(WebSocket webSocket)
        {
            WebSocket = webSocket;
            _inSession = false;
            _sessionId = -1;
            UserId = -1;
        }

        public void AddSessionInfoToSocket(int sessionId, int userId)
        {
            _inSession = true;
            _sessionId = sessionId;
            UserId = userId;
        }
    }
}

using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public class MySocket
    {
        public WebSocket WebSocket { get; set; }
        public bool InSession { get { return _inSession; } }
        public int SessionId { get { return _sessionId; } }
        public int UserId { get { return _userId; } }

        bool _inSession;
        int _sessionId;
        int _userId;

        public MySocket(WebSocket webSocket)
        {
            WebSocket = webSocket;
            _inSession = false;
            _sessionId = -1;
            _userId = -1;
        }

        public void JoinSession(int sessionId, int userId)
        {
            _inSession = true;
            _sessionId = sessionId;
            _userId = userId;
        }
    }
}

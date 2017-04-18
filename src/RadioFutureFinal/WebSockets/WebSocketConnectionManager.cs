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

        private MyContext _context;

        public WebSocketConnectionManager(MyContext context)
        {
            _context = context;
        }

        public MySocket GetMySocket(WebSocket socket)
        {
            MySocket mySocket;
            var found = _context.ActiveSockets.TryGetValue(socket, out mySocket);
            if(!found)
            {
                // TODO: exception
            }
            return mySocket;
        }

        public IEnumerable<MySocket> GetSocketsInSession(int sessionId)
        {
            List<MySocket> socketsInSession;
            var found = _context.ActiveSessions.TryGetValue(sessionId, out socketsInSession);

            if(!found)
            {
                // TODO: throw exception
            }

            return socketsInSession;
        }

        public void AddSocket(WebSocket socket)
        {
            var mySocket = new MySocket(socket);
            _context.ActiveSockets.TryAdd(socket, mySocket);
        }

        public void SocketJoinSession(MySocket socket, int sessionId, int userId)
        {
            List<MySocket> sessionSockets;
            var sessionFound = _context.ActiveSessions.TryGetValue(sessionId, out sessionSockets);

            if(sessionFound)
            {
                sessionSockets.Add(socket);
            }
            else
            {
                // First socket in the session
                var result = _context.ActiveSessions.TryAdd(sessionId, new List<MySocket>() { socket });
                if(result == false)
                {
                    // TODO: throw exception
                }
            }

            socket.AddSessionInfoToSocket(sessionId, userId);
        }

        public void RemoveSocket(WebSocket socket)
        {
            MySocket mySocket;
            var found = _context.ActiveSockets.TryRemove(socket, out mySocket);
            
            if(!found)
            {
                // TODO: throw exception
            }

            List<MySocket> socketsInSession;
            var sessionId = mySocket.SessionId;
            found = _context.ActiveSessions.TryGetValue(sessionId, out socketsInSession);
            
            if(!found)
            {
                // TODO: throw exception
            }

            socketsInSession.Add(mySocket);
        }

        private string CreateConnectionId()
        {
            return Guid.NewGuid().ToString();
        }

    }
}
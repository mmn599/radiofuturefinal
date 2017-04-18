using RadioFutureFinal.WebSockets;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal
{
    public class MyContext
    {
        public ConcurrentDictionary<WebSocket, MySocket> ActiveSockets { get; }
        // key is session id
        public ConcurrentDictionary<int, List<MySocket>> ActiveSessions { get; }

        public MyContext()
        {
            ActiveSockets = new ConcurrentDictionary<WebSocket, MySocket>();
            ActiveSessions = new ConcurrentDictionary<int, List<MySocket>>();
        }

        public void Clean()
        {
            foreach(var sessionId in ActiveSessions)
            {
                
            }
        }

    }
}

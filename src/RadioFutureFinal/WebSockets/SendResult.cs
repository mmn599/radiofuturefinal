using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public class SendResult
    {
        public bool Success { get; set; }
        public WebSocket FaultySocket { get; set; }

        public static SendResult CreateSuccess()
        {
            var sendResult = new SendResult();
            sendResult.Success = true;
            return sendResult;
        }

        public static SendResult CreateFailure(WebSocket faultySocket)
        {
            var sendResult = new SendResult();
            sendResult.Success = false;
            sendResult.FaultySocket = faultySocket;
            return sendResult;
        }
    }
}

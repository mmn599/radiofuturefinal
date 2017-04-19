using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    public class SendResult
    {
        public bool Success { get; set; }
        public List<MySocket> FaultySockets { get; set; }

        public SendResult()
        {
            FaultySockets = new List<MySocket>();
        }

        public static SendResult CreateSuccess()
        {
            var sendResult = new SendResult();
            sendResult.Success = true;
            return sendResult;
        }

        public static SendResult CreateFailure(List<MySocket> faultySockets)
        {
            var sendResult = new SendResult();
            sendResult.Success = false;
            sendResult.FaultySockets = faultySockets;
            return sendResult;
        }
    }
}

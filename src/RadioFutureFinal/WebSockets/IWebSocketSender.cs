using RadioFutureFinal.Contracts;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.WebSockets
{
    interface IWebSocketSender
    {
        Task<SendResult> ClientSessionReady(MySocket socket, Session session, MyUser user);
        Task<SendResult> ClientsUpdateSessionUsers(Session session, List<MySocket> socketsInSession);
        Task<SendResult> ClientsUpdateSessionQueue(Session session, List<MySocket> socketsInSession);
        Task<SendResult> ClientsSendChatMessage(WsMessage message, List<MySocket> socketsInSession);
    }
}

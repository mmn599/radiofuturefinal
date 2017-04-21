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
        Task<SendResult> ClientRequestUserState(int userIdRequestor, int userIdRequestee, MySocket userSocket); 
        Task<SendResult> ClientProvideUserState(MyUserV1 userInfo, MySocket userToSendTo); 
        Task<List<SendResult>> ClientsUpdateSessionUsers(Session session, List<MySocket> socketsInSession);
        Task<List<SendResult>> ClientsUpdateSessionQueue(Session session, List<MySocket> socketsInSession);
        Task<List<SendResult>> ClientsSendChatMessage(WsMessage message, List<MySocket> socketsInSession);
    }
}

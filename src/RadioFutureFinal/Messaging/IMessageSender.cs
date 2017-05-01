﻿using RadioFutureFinal.Contracts;
using RadioFutureFinal.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IMessageSender
    {
        Task<SendResult> ClientSessionReady(MySocket socket, Session session, MyUser user);
        Task<SendResult> ClientRequestUserState(int userIdRequestor, int userIdRequestee, MySocket userSocket); 
        Task<SendResult> ClientProvideUserState(MyUserV1 userInfo, MySocket userToSendTo);
        Task<SendResult> ClientSetupYTAPI(MySocket socket, string secret);
        Task<SendResult> ClientSetupAudioAPI(MySocket socket, string id, string secret); 
        Task<List<SendResult>> ClientsUpdateSessionUsers(Session session, List<MySocket> socketsInSession);
        Task<List<SendResult>> ClientsUpdateSessionQueue(Session session, List<MySocket> socketsInSession);
        Task<List<SendResult>> ClientsSendChatMessage(WsMessage message, List<MySocket> socketsInSession);
    }
}

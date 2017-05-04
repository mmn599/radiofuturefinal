using RadioFutureFinal.Contracts;
using RadioFutureFinal.Models;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IMessageSender
    {
        Task<SendResult> ClientSessionReady(MySocket socket, Session session, MyUser user);
        Task<SendResult> ClientRequestUserState(int userIdRequestor, int userIdRequestee, MySocket userSocket); 
        Task<SendResult> ClientProvideUserState(MyUserV1 userInfo, MySocket userToSendTo);
        Task<SendResult> ClientSearchResults(MySocket userToSendTo, List<MediaV1> searchResults);
        Task<List<SendResult>> ClientsUpdateSessionUsers(Session session, ConcurrentDictionary<WebSocket, MySocket> socketsInSession);
        Task<List<SendResult>> ClientsUpdateSessionQueue(Session session, ConcurrentDictionary<WebSocket, MySocket> socketsInSession);
        Task<List<SendResult>> ClientsSendChatMessage(WsMessage message, ConcurrentDictionary<WebSocket, MySocket> socketsInSession);
    }
}

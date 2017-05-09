using RadioFutureFinal.Contracts;
using System;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IActionsServer
    {
        Task JoinSession(MySocket socket, string sessionName);
        Task AddMediaToSession(MySocket socket, MediaV1 media);
        Task DeleteMediaFromSession(MySocket socket, int mediaId);
        Task SaveUserNameChange(MySocket socket, int userId, string newName);
        Task ChatMessage(MySocket socket, string userName, string chatMessage);
        Task RequestSyncWithUser(MySocket socket, int userIdRequestee);
        Task ProvideSyncToUser(MySocket socket, int userIdRequestor, UserStateV1 userState);
        Task Search(MySocket socket, string query, int page);
        Task FbLogin(MySocket socket, int oldUserId, Guid fbUserId);
    }
}

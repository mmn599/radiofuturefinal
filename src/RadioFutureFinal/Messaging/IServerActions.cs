using RadioFutureFinal.Contracts;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IServerActions
    {
        Task JoinSession(MySocket socket, string sessionName);
        Task AddMediaToSession(MySocket socket, MediaV1 media);
        Task DeleteMediaFromSession(MySocket socket, int mediaId);
        Task SaveUserNameChange(MySocket socket, int userId, string newName);
        Task ChatMessage(MySocket socket, string chatMessage, string userName);
        Task RequestSyncWithUser(MySocket socket, int userIdRequestee);
        Task ProvideSyncToUser(MySocket socket, UserState userState, int userIdRequestor);
        Task Search(MySocket socket, string query, int page);
    }
}

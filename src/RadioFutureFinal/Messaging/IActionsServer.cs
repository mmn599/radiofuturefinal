using RadioFutureFinal.Contracts;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IActionsServer
    {
        Task JoinSession(MySocket socket, MsgJoinSession message);
        Task AddMediaToSession(MySocket socket, MsgAddMediaToSession message);
        Task DeleteMediaFromSession(MySocket socket, MsgDeleteMediaFromSession message);
        Task SaveUserNameChange(MySocket socket, MsgSaveUserNameChange message);
        Task ChatMessage(MySocket socket, MsgChatMessage message);
        Task RequestSyncWithUser(MySocket socket, MsgRequestSyncWithUser message);
        Task ProvideSyncToUser(MySocket socket, MsgProvideSyncToUser message);
        Task Search(MySocket socket, MsgSearch message);
    }
}

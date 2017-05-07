using RadioFutureFinal.Contracts;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public interface IActionsClient
    {
        Task clientSessionReady(SessionV1 session, MyUserV1 user, MySocket socket);
        Task clientRequestUserState(int userIdRequestor, MySocket socket);
        Task clientProvideUserState(UserStateV1 userState, MySocket socket);
        Task clientSearchResults(List<MediaV1> searchResults, MySocket socket);

        Task clientChatMessage(string message, string userName, IEnumerable<MySocket> socket);
        Task clientUpdateUsersList(List<MyUserV1> users, IEnumerable<MySocket> socketsInSession);
        Task clientUpdateQueue(List<MediaV1> queue, IEnumerable<MySocket> socketsInSession);
    }
}

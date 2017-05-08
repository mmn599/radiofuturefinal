using RadioFutureFinal.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    // TODO: should the get methods be async? should any of the methods be async?
    public interface IDbRepository
    {
        Task<MyUser> AddNewUserToSessionAsync(string userName, Session session);
        Task<Session> AddMediaToSessionAsync(Media media, int sessionId);
        Task<Session> RemoveUserFromSessionAsync(int sessionId, int userId);
        Task UpdateUserNameAsync(int userId, string newName);
        Task<Session> CreateSessionAsync(string sessionName);
        Session GetSession(int sessionId);
        bool GetSessionByName(string sessionName, out Session session);
        Task<Session> RemoveMediaFromSessionAsync(int sessionId, int mediaId);
        MyUser GetUser(int userId);
        Task DeleteUserAsync(int userId);
        bool GetUserByFacebookId(int facebookUserId, out MyUser user);
        MyUser AddNewFbUser(int facebookUserId);
    }
}

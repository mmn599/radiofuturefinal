using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    // TODO: should the get methods be async? should any of the methods be async?
    public interface IDbRepository
    {
        Task<Session> AddUserToSessionAsync(int userId, Session session);
        Task<MyUser> AddNewTempUser();
        Task<Session> AddMediaToSessionAsync(Media media, int sessionId);
        Task<Session> RemoveUserFromSessionAsync(int sessionId, int userId);
        Task UpdateUserNameAsync(int userId, string newName);
        Task<Session> CreateSessionAsync(string sessionName);
        Session GetSession(int sessionId);
        bool GetSessionByName(string sessionName, out Session session);
        Task<Session> RemoveMediaFromSessionAsync(int sessionId, int mediaId);
        MyUser GetUser(int userId);
        Task DeleteUserAsync(int userId);
        bool GetUserByFacebookId(long facebookUserId, out MyUser user);
        MyUser AddNewFbUser(long facebookUserId);
    }
}

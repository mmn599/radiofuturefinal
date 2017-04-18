using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    // TODO: should the get methods be async? should any of the methods be async?
    public interface IDbRepository
    {
        Task<MyUser> AddNewUserToSessionAsync(string userName, Session session);
        Task<Session> AddMediaToSessionAsync(Media media, int sessionId);
        Task UpdateUserVideoState(int userId, int ytPlayerState, int videoTime, int queuePosition);
        Task<Session> RemoveUserFromSessionAsync(int sessionId, int userId);
        Task UpdateUserNameAsync(int userId, string newName);
        Task<Session> CreateSessionAsync(string sessionName);
        Session GetSession(int sessionId);
        bool GetSessionByName(string sessionName, out Session session);
        Task<Session> RemoveMediaAsync(int sessionId, int mediaId);
    }
}

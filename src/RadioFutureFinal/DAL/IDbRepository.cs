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
        Task<Media> AddMediaToSessionAsync(Media media, int sessionId);
        Task UpdateUserVideoState(int userId, int ytPlayerState, int videoTime, int queuePosition);
        Task RemoveUserFromSessionAsync(int sessionId, int userId);
        Task UpdateUserNameAsync(int userId, string newName);
        MyUser GetUser(int userId);
        IEnumerable<MyUser> GetAllUsers();
        Task<Session> CreateSessionAsync(string sessionName);
        Task RemoveSessionAsync(Session session);
        Task UpdateSessionAsync(Session session);
        Session GetSession(int sessionId);
        bool GetSessionByName(string sessionName, out Session session);
        IEnumerable<Session> GetAllSessions();

        Task AddMediaAsync(Media media);
        Task RemoveMediaAsync(int sessionId, int mediaId);
        Task UpdateMediaAsync(Media media);
        Media GetMedia(int mediaId);
        IEnumerable<Media> GetAllMedia();
    }
}

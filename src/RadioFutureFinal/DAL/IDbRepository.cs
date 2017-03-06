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
        Task<User> AddNewUserToSessionAsync(string userName, Session session);
        Task<Media> AddMediaToSessionAsync(Media media, int sessionId);
        Task UpdateUserVideoStateAsync(User user);
        Task RemoveUserAsync(User user);
        Task UpdateUserAsync(User user);
        Task UpdateUserNameAsync(User user);
        User GetUser(int userId);
        IEnumerable<User> GetAllUsers();
        Task<Session> CreateSessionAsync(string sessionName);
        Task RemoveSessionAsync(Session session);
        Task UpdateSessionAsync(Session session);
        Session GetSession(int sessionId);
        bool GetSessionByName(string sessionName, out Session session);
        IEnumerable<Session> GetAllSessions();

        Task AddMediaAsync(Media media);
        Task RemoveMediaAsync(Media media);
        Task RemoveMediaAsync(int mediaId);
        Task UpdateMediaAsync(Media media);
        Media GetMedia(int mediaId);
        IEnumerable<Media> GetAllMedia();
    }
}

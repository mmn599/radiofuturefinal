using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    public interface IDbRepository
    {
        void AddUser(User user);
        void RemoveUser(User user);
        void UpdateUser(User user);
        User GetUser(int userId);
        IEnumerable<User> GetAllUsers();

        void AddSession(Session session);
        void RemoveSession(Session session);
        void UpdateSession(Session session);
        Session GetSession(int sessionId);
        IEnumerable<Session> GetAllSessions();

        void AddMedia(Media media);
        void RemoveMedia(Media media);
        void UpdateMedia(Media media);
        Media GetMedia(int mediaId);
        IEnumerable<Media> GetAllMedia();
    }
}

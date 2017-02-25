using RadioFutureFinal.Data;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    public class DbRepository : IDbRepository
    {
        private readonly ApplicationDbContext _context;

        public DbRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public void AddUser(User user)
        {
            _context.User.Add(user);
            _context.SaveChanges();
        }

        public void RemoveUser(User user)
        {
            _context.User.Remove(user);
            _context.SaveChanges();
        }

        public void UpdateUser(User user)
        {
            _context.User.Update(user);
            _context.SaveChanges();
        }

        public User GetUser(int userId)
        {
            return _context.User.FirstOrDefault(t => t.UserID == userId);
        }

        public IEnumerable<User> GetAllUsers()
        {
            return _context.User.ToList();
        }

        public void AddSession(Session session)
        {
            _context.Session.Add(session);
            _context.SaveChanges();
        }
        public void RemoveSession(Session session)
        {
            _context.Session.Remove(session);
            _context.SaveChanges();
        }
        public void UpdateSession(Session session)
        {
            _context.Session.Update(session);
            _context.SaveChanges();
        }
        public Session GetSession(int sessionId)
        {
            return _context.Session.FirstOrDefault(t => t.SessionID == sessionId);
        }
        public IEnumerable<Session> GetAllSessions()
        {
            return _context.Session.ToList();
        }

        public void AddMedia(Media media)
        {
            _context.Media.Add(media);
            _context.SaveChanges();
        }
        public void RemoveMedia(Media media)
        {
            _context.Media.Remove(media);
            _context.SaveChanges();
        }
        public void UpdateMedia(Media media)
        {
            _context.Media.Update(media);
            _context.SaveChanges();
        }
        public Media GetMedia(int mediaId)
        {
            return _context.Media.FirstOrDefault(t => t.MediaID == mediaId);
        }
        public IEnumerable<Media> GetAllMedia()
        {
            return _context.Media.ToList();
        }
    }
}

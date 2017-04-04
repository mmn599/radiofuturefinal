﻿using Microsoft.EntityFrameworkCore;
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

        public async Task<MyUser> AddNewUserToSessionAsync(string userName, Session session)
        {
            var user = new MyUser(userName);
            session.Users.Add(user);
            await UpdateSessionAsync(session);
            return user;
        }

        public async Task<Media> AddMediaToSessionAsync(Media media, int sessionId)
        {
            var session = GetSession(sessionId);
            session.Queue.Add(media);
            await UpdateSessionAsync(session);
            return media;
        }

        public async Task RemoveUserFromSessionAsync(int sessionId, int userId)
        {
            var session = GetSession(sessionId);
            var user = session.Users.FirstOrDefault(m => m.MyUserId == userId);
            session.Users.Remove(user);
            _context.Session.Update(session);
            await _context.SaveChangesAsync();
        }

        //TODO: What the hell. Why isn't the commented code working? Find this out. Or just move off entity framework.
        // This requires two database lookups (I think)
        public async Task UpdateUserVideoState(int userId, int ytPlayerState, int videoTime, int queuePosition)
        {
            /*
            var entry = _context.Entry(updatedUser);
            entry.Property(e => e.YTPlayerState).IsModified = true;
            entry.Property(e => e.QueuePosition).IsModified = true;
            entry.Property(e => e.VideoTime).IsModified = true;
            _context.SaveChanges();
            */
            var user = GetUser(userId);
            user.YTPlayerState = ytPlayerState;
            user.VideoTime = videoTime;
            user.QueuePosition = queuePosition;
            await _context.SaveChangesAsync();
        }

        public async Task UpdateUserNameAsync(int userId, string newName)
        {
            var user = GetUser(userId);
            user.Name = newName;
            await _context.SaveChangesAsync();
        }

        public MyUser GetUser(int userId)
        {
            return _context.MyUser.FirstOrDefault(t => t.MyUserId == userId);
        }

        public IEnumerable<MyUser> GetAllUsers()
        {
            return _context.MyUser.ToList();
        }
        public async Task<Session> CreateSessionAsync(string sessionName)
        {
            var session = new Session(sessionName);
            _context.Session.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }
        public async Task RemoveSessionAsync(Session session)
        {
            _context.Session.Remove(session);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateSessionAsync(Session session)
        {
            _context.Session.Update(session);
            await _context.SaveChangesAsync();
        }
        public Session GetSession(int sessionId)
        {
            return _context.Session.Where(s => s.SessionID == sessionId)
                                    .Include(s => s.Queue)
                                    .Include(s => s.Users)
                                    .FirstOrDefault();
        }
        public bool GetSessionByName(string sessionName, out Session session)
        {
            session = _context.Session.Where(s => s.Name == sessionName)
                                    .Include(s => s.Queue)
                                    .Include(s => s.Users)
                                    .FirstOrDefault();
            return session != null;
        }

        public IEnumerable<Session> GetAllSessions()
        {
            return _context.Session.ToList();
        }

        public async Task AddMediaAsync(Media media)
        {
            _context.Media.Add(media);
            await _context.SaveChangesAsync();
        }
        //TODO: Don't know how to do removing stuff properly
        public async Task RemoveMediaAsync(int sessionId, int mediaId)
        {
            var session = GetSession(sessionId);
            var media = session.Queue.FirstOrDefault(m => m.MediaID == mediaId);
            session.Queue.Remove(media);
            _context.Session.Update(session);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateMediaAsync(Media media)
        {
            _context.Media.Update(media);
            await _context.SaveChangesAsync();
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

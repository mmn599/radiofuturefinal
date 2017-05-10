using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RadioFutureFinal.Data;
using RadioFutureFinal.Errors;
using RadioFutureFinal.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    public class DbRepository : IDbRepository
    {

        private static IConfigurationRoot _configuration;

        public DbRepository(IConfigurationRoot configuration)
        {
            _configuration = configuration;   
        }

        // TODO: use other factory
        private static ApplicationDbContext ContextFactory()
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(_configuration.GetConnectionString("DefaultConnection"));
            return new ApplicationDbContext(optionsBuilder.Options); 
        }

        private Session _getSessionInternal(ApplicationDbContext sourceContext, int sessionId)
        {
            return sourceContext.Session.Where(s => s.SessionID == sessionId)
                                .Include(s => s.Queue)
                                .FirstOrDefault();
        }

        // Assumes fully populated session
        public async Task _updateSessionAsyncInternal(Session session, ApplicationDbContext sourceContext)
        {
            sourceContext.Session.Update(session);
            await sourceContext.SaveChangesAsync();
        }

        public async Task<Session> AddMediaToSessionAsync(Media media, int sessionId) 
        {
            using (var context = ContextFactory())
            {
                var session = _getSessionInternal(context, sessionId);
                if(session == null)
                {
                    throw new RadioException("AddMediaToSessionAsync: session with id: " + sessionId + " not found.");
                } 
                session.Queue.Add(media);
                await _updateSessionAsyncInternal(session, context);
                return session;
            }
        }

        public async Task<Session> CreateSessionAsync(string sessionName)
        {
            using (var context = ContextFactory())
            {
                var session = new Session(sessionName);
                context.Session.Add(session);
                try
                {
                    await context.SaveChangesAsync();
                    return session;
                }
                catch(DbUpdateException exception)
                {
                    Session alreadyCreatedSession;
                    var found = GetSessionByName(sessionName, out alreadyCreatedSession);
                    if(!found)
                    {
                        // TODO: exception handling
                    }
                    return alreadyCreatedSession;
                }
            }
        }

        public Session GetSession(int sessionId)
        {
            using (var context = ContextFactory())
            {
                return _getSessionInternal(context, sessionId);
            }
        }

        public bool GetSessionByName(string sessionName, out Session session)
        {
            using (var context = ContextFactory())
            {
                session = context.Session.Where(s => s.Name == sessionName)
                                    .Include(s => s.Queue)
                                    .FirstOrDefault();
                return session != null;
            }
        }

        //TODO: Don't know how to remove stuff properly
        public async Task<Session> RemoveMediaFromSessionAsync(int sessionId, int mediaId)
        {
            using (var context = ContextFactory())
            {
                var session = _getSessionInternal(context, sessionId);
                if(session == null)
                {
                    throw new RadioException("RemoveMediaFromSessionAsync: Session not found for id: " + sessionId);
                }
                var media = session.Queue.FirstOrDefault(m => m.MediaID == mediaId);
                if(media == null)
                {
                    throw new RadioException("RemoveMediaFromSessionAsync: Media not found for id: " + mediaId);
                }
                session.Queue.Remove(media);
                context.Session.Update(session);
                await context.SaveChangesAsync();
                return session;
            }
        }

        public async Task SaveSessionHitsAsync(Session updatedSession)
        {
            using (var context = ContextFactory())
            {
                context.Session.Attach(updatedSession);
                context.Entry(updatedSession).Property(s => s.Hits).IsModified = true;
                await context.SaveChangesAsync();
            }
        }

    }
}

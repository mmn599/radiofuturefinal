using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RadioFutureFinal.Data;
using RadioFutureFinal.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    // TODO: This entire class contains some scary stuff.
    // For one, things are pretty inefficient because I'm not very EF savvy.
    // Also, race conditions may fuck stuff up because I'm not very EF savvy.
        // See: AddUserToSessionAsync
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
                                .Include(s => s.Users)
                                .FirstOrDefault();
        }

        private MyUser _getUserInternal(int userId, ApplicationDbContext sourceContext)
        {
            return sourceContext.MyUser.Where(t => t.MyUserId == userId).FirstOrDefault();
        }

        private MyUser _getUserByFacebookId(long facebookId, ApplicationDbContext sourceContext)
        {
            return sourceContext.MyUser.Where(t => t.FacebookId == facebookId)
                                    .Include(s => s.PriorSessions).FirstOrDefault();
        }

        public MyUser GetUser(int userId)
        {
            using (var context = ContextFactory())
            {
                return _getUserInternal(userId, context);
            }
        }

        // Assumes fully populated session
        public async Task UpdateSessionAsyncInternal(Session session, ApplicationDbContext sourceContext)
        {
            sourceContext.Session.Update(session);
            await sourceContext.SaveChangesAsync();
        }

        // TODO: ensure EF just adds a user and doesn't update a non fully populated session
        public async Task<Session> AddUserToSessionAsync(int userId, Session session)
        {
            using (var context = ContextFactory())
            {
                var user = _getUserInternal(userId, context);
                session.Users.Add(user);
                await UpdateSessionAsyncInternal(session, context);
                return session;
            }
        }

        public async Task<Session> AddMediaToSessionAsync(Media media, int sessionId)
        {
            using (var context = ContextFactory())
            {
                var session = _getSessionInternal(context, sessionId);
                session.Queue.Add(media);
                await UpdateSessionAsyncInternal(session, context);
                return session;
            }
        }

        public async Task<Session> RemoveUserFromSessionAsync(int sessionId, int userId)
        {
            using (var context = ContextFactory())
            {
                var session = _getSessionInternal(context, sessionId);
                var user = session.Users.Where(m => m.MyUserId == userId).FirstOrDefault();
                if(user != null)
                {
                    session.Users.Remove(user);
                    context.Session.Update(session);
                    await context.SaveChangesAsync();
                }
                return session;
            }
        }

        public async Task UpdateUserNameAsync(int userId, string newName)
        {
            using (var context = ContextFactory())
            {
                var user = _getUserInternal(userId, context);
                user.Name = newName;
                await context.SaveChangesAsync();
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
                                    .Include(s => s.Users)
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
                var media = session.Queue.Where(m => m.MediaID == mediaId).FirstOrDefault();
                session.Queue.Remove(media);
                context.Session.Update(session);
                await context.SaveChangesAsync();
                return session;
            }
        }

        //TODO: Don't know how to remove stuff properly
        public async Task DeleteUserAsync(int userId)
        {
            using (var context = ContextFactory())
            {
                var user = new MyUser() { MyUserId = userId };
                context.MyUser.Attach(user);
                context.MyUser.Remove(user);
                await context.SaveChangesAsync();
            }
        }

        public bool GetUserByFacebookId(long facebookUserId, out MyUser user)
        {
            using (var context = ContextFactory())
            {
                var userResult = _getUserByFacebookId(facebookUserId, context);
                if(userResult != null)
                {
                    user = userResult;
                    return true;
                }
                user = null;
                return false;
            }
        }

        public MyUser AddNewFbUser(long facebookUserId)
        {
            using (var context = ContextFactory())
            {
                var user = new MyUser(facebookUserId);
                context.MyUser.Add(user);
                context.SaveChanges();
                return user;
            }
        }

        public async Task<MyUser> AddNewTempUser()
        {
            using (var context = ContextFactory())
            {
                var newTempUser = new MyUser();
                newTempUser.Temporary = true;
                context.MyUser.Add(newTempUser);
                await context.SaveChangesAsync();
                return newTempUser;
            }
        }

    }
}

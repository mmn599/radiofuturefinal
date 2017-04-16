using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RadioFutureFinal.Data;
using RadioFutureFinal.Models;
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

        //TODO: get rid and use factory
        private static ApplicationDbContext ContextFactory()
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(_configuration.GetConnectionString("DefaultConnection"));
            return new ApplicationDbContext(optionsBuilder.Options); 
        }

        private Session GetSessionInternal(ApplicationDbContext sourceContext, int sessionId)
        {
            return sourceContext.Session.Where(s => s.SessionID == sessionId)
                                .Include(s => s.Queue)
                                .Include(s => s.Users)
                                .FirstOrDefault();
        }

        private MyUser GetUserInternal(int userId, ApplicationDbContext sourceContext)
        {
            return sourceContext.MyUser.FirstOrDefault(t => t.MyUserId == userId);
        }

        // Assumes fully populated session
        public async Task UpdateSessionAsyncInternal(Session session, ApplicationDbContext sourceContext)
        {
            sourceContext.Session.Update(session);
            await sourceContext.SaveChangesAsync();
        }

        public async Task<MyUser> AddNewUserToSessionAsync(string userName, Session session)
        {
            using (var context = ContextFactory())
            {
                var user = new MyUser(userName);
                session.Users.Add(user);
                await UpdateSessionAsyncInternal(session, context);
                return user;
            }
        }

        public async Task<Media> AddMediaToSessionAsync(Media media, int sessionId)
        {
            using (var context = ContextFactory())
            {
                var session = GetSessionInternal(context, sessionId);
                session.Queue.Add(media);
                await UpdateSessionAsyncInternal(session, context);
                return media;
            }
        }

        public async Task RemoveUserFromSessionAsync(int sessionId, int userId)
        {
            using (var context = ContextFactory())
            {
                var session = GetSessionInternal(context, sessionId);
                var user = session.Users.FirstOrDefault(m => m.MyUserId == userId);
                session.Users.Remove(user);
                context.Session.Update(session);
                await context.SaveChangesAsync();
            }
        }

        public async Task UpdateUserVideoState(int userId, int ytPlayerState, int videoTime, int queuePosition)
        {
            // TODO: Use modified entries to make this one call
            using (var context = ContextFactory())
            {
                var user = GetUserInternal(userId, context);
                user.YTPlayerState = ytPlayerState;
                user.VideoTime = videoTime;
                user.QueuePosition = queuePosition;
                await context.SaveChangesAsync();
            }
        }

        public async Task UpdateUserNameAsync(int userId, string newName)
        {
            using (var context = ContextFactory())
            {
                var user = GetUserInternal(userId, context);
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
                await context.SaveChangesAsync();
                return session;
            }
        }


        public Session GetSession(int sessionId)
        {
            using (var context = ContextFactory())
            {
                return GetSessionInternal(context, sessionId);
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

        //TODO: Don't know how to do removing stuff properly
        public async Task RemoveMediaAsync(int sessionId, int mediaId)
        {
            using (var context = ContextFactory())
            {
                var session = GetSessionInternal(context, sessionId);
                var media = session.Queue.FirstOrDefault(m => m.MediaID == mediaId);
                session.Queue.Remove(media);
                context.Session.Update(session);
                await context.SaveChangesAsync();
            }
        }

    }
}

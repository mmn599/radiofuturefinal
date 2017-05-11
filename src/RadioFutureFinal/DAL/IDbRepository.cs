using RadioFutureFinal.Models;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    public interface IDbRepository
    {
        // TODO: make this method cleaner
        Task AddMediaToSessionAsync(Session updatedSession);
        Task DeleteMedia(Media mediaToDelete);
        Task AddMediaToSession(Session updatedSession);
        Task<Session> CreateSessionAsync(string sessionName);
        Session GetSession(int sessionId);
        bool GetSessionByName(string sessionName, out Session session);
        Task SaveSessionHitsAsync(Session updatedSession);
    }
}

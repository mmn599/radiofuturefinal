using RadioFutureFinal.Models;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    public interface IDbRepository
    {
        Task SaveSessionQueueAsync(Session updatedSession);
        Task<Session> CreateSessionAsync(string sessionName);
        Session GetSession(int sessionId);
        bool GetSessionByName(string sessionName, out Session session);
        Task SaveSessionHitsAsync(Session updatedSession);
    }
}

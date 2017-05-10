using RadioFutureFinal.Models;
using System.Threading.Tasks;

namespace RadioFutureFinal.DAL
{
    // TODO: should the get methods be async? should any of the methods be async?
    public interface IDbRepository
    {
        Task<Session> AddMediaToSessionAsync(Media media, int sessionId);
        Task<Session> CreateSessionAsync(string sessionName);
        Session GetSession(int sessionId);
        bool GetSessionByName(string sessionName, out Session session);
        Task<Session> RemoveMediaFromSessionAsync(int sessionId, int mediaId);
        Task SaveSessionHitsAsync(Session session);
    }
}

using Microsoft.AspNetCore.Mvc;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Models;
using RadioFutureFinal.Search;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Controllers
{
    public class SessionController : Controller
    {
        IDbRepository _db;
        Searcher _searcher;

        public SessionController(IDbRepository db, Searcher searcher)
        {
            _db = db;
            _searcher = searcher;
        }

        [HttpGet]
        public async Task<SessionV1> JoinSession([FromRoute] string sessionName)
        {
            Session session = null;
            bool sessionFound = _db.GetSessionByName(sessionName, out session);
            if (!sessionFound)
            {
                session = await _db.CreateSessionAsync(sessionName);
            }
            return session.ToContract();
        }

        [HttpPost]
        public async Task<List<MediaV1>> AddMedia([FromRoute] int sessionId, [FromBody] MediaV1 media)
        {
            var updatedSession = await _db.AddMediaToSessionAsync(media.ToModel(), sessionId);
            return updatedSession.ToContract().Queue;
        }

        [HttpPost]
        public async Task<List<MediaV1>> DeleteMedia([FromRoute] int sessionId, [FromRoute] int mediaId)
        {
            var updatedSession = await _db.RemoveMediaFromSessionAsync(sessionId, mediaId);
            return updatedSession.ToContract().Queue;
        }

        [HttpGet]
        public async Task<List<MediaV1>> SearchAsync(string query, int page)
        {
            var searchResults = await _searcher.searchPodcasts(query, page);
            return searchResults;
        }
    }
}

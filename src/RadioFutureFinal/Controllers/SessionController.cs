using Microsoft.AspNetCore.Mvc;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Models;
using RadioFutureFinal.Search;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System;

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
        public async Task<List<MediaV1>> AddMedia([FromRoute] int sessionId, string mediaString)
        {
            MediaV1 mediaToQueue = null;
            try
            {
                mediaToQueue = JsonConvert.DeserializeObject<MediaV1>(mediaString);
            }
            catch(Exception e)
            {

            }

            var updatedSession = await _db.AddMediaToSessionAsync(mediaToQueue.ToModel(), sessionId);
            return updatedSession.ToContract().Queue;
        }

        [HttpPost]
        public async Task<List<MediaV1>> DeleteMedia([FromRoute] int sessionId, [FromRoute] int mediaId)
        {
            var updatedSession = await _db.RemoveMediaFromSessionAsync(sessionId, mediaId);
            return updatedSession.ToContract().Queue;
        }

        [HttpGet]
        public async Task<List<MediaV1>> Search([FromQuery] string query, [FromQuery] int page)
        {
            var searchResults = await _searcher.searchPodcasts(query, page);
            return searchResults;
        }
    }
}

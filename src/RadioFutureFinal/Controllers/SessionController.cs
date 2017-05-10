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
using RadioFutureFinal.Errors;

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
        public async Task<IActionResult> AddMedia([FromRoute] int sessionId, string mediaString)
        {
            MediaV1 mediaToQueue = null;
            try
            {
                mediaToQueue = JsonConvert.DeserializeObject<MediaV1>(mediaString);
            }
            catch
            {
                return NotFound();
            }

            try
            {
                var updatedSession = await _db.AddMediaToSessionAsync(mediaToQueue.ToModel(), sessionId);
                return Ok(updatedSession.ToContract().Queue);
            }
            catch
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<IActionResult> DeleteMedia([FromRoute] int sessionId, [FromRoute] int mediaId)
        {
            try
            {
                var updatedSession = await _db.RemoveMediaFromSessionAsync(sessionId, mediaId);
                return Ok(updatedSession.ToContract().Queue);
            }
            catch
            {
                return NotFound();
            }
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] int page)
        {
            if(!validQuery(query, page))
            {
                return NotFound();
            }
            var searchResults = await _searcher.searchPodcasts(query, page);
            return Ok(searchResults);
        }

        private bool validQuery(string query, int page)
        {
            if(page < 0)
            {
                return false;
            }
            if(string.IsNullOrEmpty(query))
            {
                return false;
            }

            return true;
        }
    }
}

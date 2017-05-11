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
using Microsoft.AspNetCore.Hosting.Internal;
using System.Linq;

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
        public async Task<IActionResult> JoinSession([FromRoute] string sessionName)
        {
            Session session = null;

            try
            {
                bool sessionFound = _db.GetSessionByName(sessionName, out session);
                if (!sessionFound)
                {
                    session = await _db.CreateSessionAsync(sessionName);
                }

                session.Hits += 1;
                await _db.SaveSessionHitsAsync(session);

                var contract = session.ToContract();
                contract.UserCanLock = !session.Locked;

                return Ok(contract);
            }
            catch
            {
                return NotFound();
            }

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

            Session session;
            bool locked;
            bool found = _getSession(sessionId, out session, out locked);

            if(!found)
            {
                return NotFound();
            }
            if(locked)
            {
                return BadRequest();
            }

            try
            {
                session.Queue.Add(mediaToQueue.ToModel());
                await _db.SaveSessionQueueAsync(session);
                return Ok(session.ToContract().Queue);
            }
            catch(Exception e)
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<IActionResult> DeleteMedia([FromRoute] int sessionId, [FromRoute] int mediaId)
        {
            Session session;
            bool locked;
            bool found = _getSession(sessionId, out session, out locked);

            if(!found)
            {
                return NotFound();
            }
            if(locked)
            {
                return BadRequest();
            }

            var media = session.Queue.FirstOrDefault(m => m.MediaID == mediaId);
            if(media == null)
            {
                return NotFound();
            }
            session.Queue.Remove(media);
            await _db.SaveSessionQueueAsync(session);
            return Ok(session.ToContract().Queue);
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] int page)
        {
            if(!_validQuery(query, page))
            {
                return NotFound();
            }
            var searchResults = await _searcher.searchPodcasts(query, page);
            return Ok(searchResults);
        }

        [HttpGet]
        public async Task<IActionResult> Lock([FromRoute] int sessionId)
        {
            Session session;
            bool locked;
            var found = _getSession(sessionId, out session, out locked);

            if(!found)
            {
                return NotFound();
            }

            session.Locked = true;
            await _db.SaveSessionLockedAsync(session);

            return Ok();
        }


        private bool _getSession(int sessionId, out Session session, out bool locked)
        {
            session = _db.GetSession(sessionId);
            if(session != null)
            {
                locked = session.Locked;
                return true;
            }

            locked = false;
            return false;
        }

        private bool _validQuery(string query, int page)
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

using Microsoft.AspNetCore.Mvc;

namespace RadioFutureFinal.Controllers
{
    public class RoomController : Controller
    {
        public string Index()
        {
            return "Put in a room name dawg!";
        }

        public IActionResult EnterRoom(string roomName)
        {
            ViewData["roomName"] = roomName;
            ViewData["roomType"] = "podcasts";
            if(Utils.BroserIsMobile(HttpContext))
            {
                return View("~/Views/Room/RoomViewMobile.cshtml");
            }
            return View("~/Views/Room/RoomView.cshtml");
        }

        /*
        public async Task JoinSession(MySocket socket, string sessionName)
        {
            Session session = null;
            bool sessionFound = _db.GetSessionByName(sessionName, out session);
            if (!sessionFound)
            {
                session = await _db.CreateSessionAsync(sessionName);
            }

            var sessionId = session.SessionID;

            _myContext.SocketJoinSession(socket, sessionId, user.MyUserId);

            var sessionV1 = session.ToContract();
            await _sender.clientSessionReady(sessionV1, user.ToContract(), socket);
            await _sender.clientUpdateUsersList(sessionV1.Users, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task AddMediaToSession(MySocket socket, MediaV1 media)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.AddMediaToSessionAsync(media.ToModel(), sessionId);
            await _sender.clientUpdateQueue(updatedSession.ToContract().Queue, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task DeleteMediaFromSession(MySocket socket, int mediaId)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.RemoveMediaFromSessionAsync(sessionId, mediaId);
            await _sender.clientUpdateQueue(updatedSession.ToContract().Queue, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task Search(MySocket socket, string query, int page)
        {
            var searchResults = await _searcher.searchPodcasts(query, page);
            await _sender.clientSearchResults(searchResults, socket);
        }
        */

    }
}
using Microsoft.AspNetCore.Mvc;

namespace RadioFutureFinal.Controllers
{
    public class RoomController : Controller
    {
        public string Index()
        {
            return "Put in a room name dawg!";
        }

        public IActionResult EnterRoom(string roomType = "podcasts", string roomName = "default_room_name")
        {
            ViewData["roomName"] = roomName;
            ViewData["roomType"] = roomType;
            if(roomType == "podcasts")
            {
                return View("~/Views/Room/PodcastRoom.cshtml");
            }
            else if(roomType == "youtube")
            {
                if(Utils.BroserIsMobile(HttpContext))
                {
                    return View("~/Views/Room/YTRoomMobile.cshtml");
                }
                return View("~/Views/Room/YTRoom.cshtml");
            }
            else
            {
                return View("~/Views/Error/Error.cshtml");
            }
        }
    }
}
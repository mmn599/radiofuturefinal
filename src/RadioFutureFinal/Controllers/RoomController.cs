using Microsoft.AspNetCore.Mvc;

namespace RadioFutureFinal.Controllers
{
    public class RoomController : Controller
    {
        public string Index()
        {
            return "Put in a room name dawg!";
        }

        public IActionResult EnterRoom(string name = "default_room_name")
        {
            ViewData["roomName"] = name;
            if(Utils.BroserIsMobile(HttpContext))
            {
                return View("~/Views/Room/EnterRoomMobile.cshtml");
            }
            return View("~/Views/Room/EnterRoom.cshtml");
        }
    }
}
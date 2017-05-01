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
            if(Utils.BroserIsMobile(HttpContext))
            {
                return View("~/Views/Room/RoomViewMobile.cshtml");
            }
            return View("~/Views/Room/RoomView.cshtml");
        }
    }
}
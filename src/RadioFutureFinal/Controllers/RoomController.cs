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
            return View("~/Views/Room/RoomView.cshtml");
        }
    }
}
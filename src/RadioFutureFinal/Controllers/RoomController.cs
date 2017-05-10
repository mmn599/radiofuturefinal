using Microsoft.AspNetCore.Mvc;
using System.Net;

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
            ViewData["roomName"] = WebUtility.UrlDecode(roomName);
            if(Utils.BroserIsMobile(HttpContext))
            {
                return View("~/Views/Room/RoomViewMobile.cshtml");
            }
            return View("~/Views/Room/RoomView.cshtml");
        }


    }
}
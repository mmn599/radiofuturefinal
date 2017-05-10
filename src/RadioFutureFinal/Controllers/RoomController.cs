using Microsoft.AspNetCore.Mvc;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Models;
using RadioFutureFinal.Search;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

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
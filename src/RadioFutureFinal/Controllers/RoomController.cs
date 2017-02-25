using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
            return View();
        }
    }
}
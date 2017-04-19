using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace RadioFutureFinal.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            if(Utils.BroserIsMobile(HttpContext))
            {
                return View("~/Views/Home/IndexMobile.cshtml");
            }
            return View("~/Views/Home/Index.cshtml");
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}

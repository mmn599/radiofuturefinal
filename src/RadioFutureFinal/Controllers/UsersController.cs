using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using RadioFutureFinal.Data;
using RadioFutureFinal.Models;
using RadioFutureFinal.DAL;

namespace RadioFutureFinal.Controllers
{
    public class UsersController : Controller
    {
        private readonly IDbRepository _db;

        public UsersController(IDbRepository db)
        {
            _db = db;    
        }

        public string Index()
        {
            return _db.GetAllUsers().ToString();
        }
    }
}

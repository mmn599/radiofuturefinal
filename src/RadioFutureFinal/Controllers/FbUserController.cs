using Microsoft.AspNetCore.Mvc;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Controllers
{
    public class FbUserController : Controller
    {
        IDbRepository _db;

        public FbUserController(IDbRepository db)
        {
            _db = db;
        }

        public string Index()
        {
            return "yeet";
        }

        public MyUserV1 Get(Guid facebookId)
        {
            MyUser user;
            var found = _db.GetUserByFacebookId(facebookId, out user);
            if(!found)
            {
                user = _db.AddNewFbUser(facebookId);
            }
            return user.ToContract();
        }
    }
}

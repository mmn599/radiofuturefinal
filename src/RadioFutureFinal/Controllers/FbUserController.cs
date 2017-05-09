using Microsoft.AspNetCore.Mvc;
using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.External;
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
        SSOManager _ssoManager;

        public FbUserController(SSOManager manager)
        {
            _ssoManager = manager;
        }

        public string Index()
        {
            return "yeet";
        }

        // TODO: need to have some kind of auth here
        public MyUserV1 Get(long facebookId)
        {
            MyUser user = _ssoManager.GetOrCreateFbUser(facebookId);
            return user.ToContract();
        }
    }
}

using RadioFutureFinal.DAL;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.External
{
    public class SSOManager
    {
        IDbRepository _db;

        public SSOManager(IDbRepository db)
        {
            _db = db;
        }

        public MyUser GetOrCreateFbUser(long fbUserId)
        {
            MyUser user;
            var found = _db.GetUserByFacebookId(fbUserId, out user);
            if(!found)
            {
                user = _db.AddNewFbUser(fbUserId);
            }
            return user;
        }

    }
}

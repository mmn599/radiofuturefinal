using System;
using System.Collections.Generic;

namespace RadioFutureFinal.Models
{
    public class MyUser
    {
        public int MyUserId { get; set; }
        public string Name { get; set; }
        public List<SessionHistory> PriorSessions { get; set; }
        public long? FacebookId { get; set; }
        public bool Temporary { get; set; }

        public MyUser(long facebookId)
        {
            FacebookId = facebookId;
            Temporary = false;
            PriorSessions = new List<SessionHistory>();
        }

        public MyUser()
        {
            PriorSessions = new List<SessionHistory>();
        }
    }
}

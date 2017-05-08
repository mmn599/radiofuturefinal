using System.Collections.Generic;

namespace RadioFutureFinal.Models
{
    public class MyUser
    {
        public int MyUserId { get; set; }
        public string Name { get; set; }
        public List<SessionHistory> PriorSessions { get; set; }
        public int FacebookId { get; set; }
        public bool Temporary { get; set; }

        public MyUser(string userName)
        {
            Name = userName;
            Temporary = true;
        }

        public MyUser(int facebookId)
        {
            FacebookId = facebookId;
        }

        public MyUser()
        {

        }
    }
}

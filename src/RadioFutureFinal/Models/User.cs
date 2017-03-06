using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string Name { get; set; }
        public List<Media> Recs { get; set; }
        public int VideoTime { get; set; }
        public int QueuePosition { get; set; }
        public int YTPlayerState { get; set; }
        public bool Waiting { get; set; }

        public User(string userName)
        {
            Name = userName;
            Recs = new List<Media>();
        }
    }
}

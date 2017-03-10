using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Models
{
    public class MyUser
    {
        public int MyUserId { get; set; }
        public string Name { get; set; }
        public List<Media> Recs { get; set; }
        public int VideoTime { get; set; }
        public int QueuePosition { get; set; }
        public int YTPlayerState { get; set; }
        public bool Waiting { get; set; }

        public MyUser(string userName)
        {
            QueuePosition = -1;
            Name = userName;
            Recs = new List<Media>();
        }

        public MyUser()
        {
            QueuePosition = -1;
            Recs = new List<Media>();
        }
    }
}

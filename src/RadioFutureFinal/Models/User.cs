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

        public MyUser(string userName)
        {
            Name = userName;
            Recs = new List<Media>();
        }

        public MyUser()
        {
            Recs = new List<Media>();
        }
    }
}

using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Models
{
    public class Session
    {
        public int SessionID { get; set; }
        public string Name { get; set; }
        public List<MyUser> Users { get; set; }
        public List<Media> Queue { get; set; }

        public Session(string name)
        {
            Users = new List<MyUser>();
            Queue = new List<Media>();
            Name = name;
        }

        public Session()
        {

        }
    }
}

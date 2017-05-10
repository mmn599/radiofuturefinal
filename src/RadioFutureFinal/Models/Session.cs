using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Models
{
    public class Session
    {
        public int SessionID { get; set; }
        public string Name { get; set; }
        public List<Media> Queue { get; set; }

        public Session(string name)
        {
            Queue = new List<Media>();
            Name = name;
        }

        public Session()
        {

        }
    }
}

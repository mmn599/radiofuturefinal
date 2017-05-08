using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Models
{
    public class SessionHistory
    {
        public int SessionHistoryID { get; set; }
        public int SessionID { get; set; }
        public string Name { get; set; }
        public string URL { get; set; }
    }
}

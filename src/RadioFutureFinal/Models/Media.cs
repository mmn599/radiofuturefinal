using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Models
{
    public class Media
    {
        public int MediaID { get; set; }
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string YTVideoID { get; set; }
        public string VideoTitle { get; set; }
        public string ThumbURL { get; set; }

        public Media()
        {

        }
    }
}

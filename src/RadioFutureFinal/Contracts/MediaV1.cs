using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class MediaV1
    {
        public int Id { get; set; }

        public int UserID { get; set; }

        public string UserName { get; set; }

        public string YTVideoID { get; set; }

        public int Likes { get; set; }

        public int Dislikes { get; set; }

        public string ThumbURL { get; set; }

    }
}

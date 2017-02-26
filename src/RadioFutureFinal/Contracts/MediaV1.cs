using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class MediaV1
    {
        [JsonProperty]
        public int MediaID { get; set; }

        [JsonProperty]
        public int UserID { get; set; }

        [JsonProperty]
        public string UserName { get; set; }

        [JsonProperty]
        public string YTVideoID { get; set; }

        [JsonProperty]
        public int Likes { get; set; }

        [JsonProperty]
        public int Dislikes { get; set; }

        [JsonProperty]
        public string ThumbURL { get; set; }

    }
}

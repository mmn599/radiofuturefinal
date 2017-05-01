using Newtonsoft.Json;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class MediaV1
    {
        [JsonProperty]
        public int Id { get; set; }

        [JsonProperty]
        public int UserId { get; set; }

        [JsonProperty]
        public string UserName { get; set; }

        [JsonProperty]
        public string YTVideoID { get; set; }

        [JsonProperty]
        public string VideoTitle { get; set; }

        [JsonProperty]
        public string ThumbURL { get; set; }

        [JsonProperty]
        public string MP3Source { get; set; }

        [JsonProperty]
        public string OGGSource { get; set; }
    }
}

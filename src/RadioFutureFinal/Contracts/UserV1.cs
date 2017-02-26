using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class UserV1
    {
        [JsonProperty]
        public string Name { get; set; }

        [JsonProperty]
        public int VideoTime { get; set; }

        [JsonProperty]
        public int QueuePosition { get; set; }

        [JsonProperty]
        public int YTPlayerState { get; set; }

        [JsonProperty]
        public bool Waiting { get; set; }
    }
}

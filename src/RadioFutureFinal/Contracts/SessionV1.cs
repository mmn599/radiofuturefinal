using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class SessionV1
    {
        [JsonProperty]
        public int SessionID { get; set; }

        [JsonProperty]
        public string Name { get; set; }

        [JsonProperty]
        public List<UserV1> Users { get; set; }

        [JsonProperty]
        public List<MediaV1> Queue { get; set; }
    }
}

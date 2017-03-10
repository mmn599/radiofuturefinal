using Newtonsoft.Json;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class SessionV1
    {
        [JsonProperty]
        public int Id { get; set; }

        [JsonProperty]
        public string Name { get; set; }

        [JsonProperty]
        public List<MyUserV1> Users { get; set; }

        [JsonProperty]
        public List<MediaV1> Queue { get; set; }

        public SessionV1()
        {
            
        }

    }
}

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
        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "queue")]
        public List<MediaV1> Queue { get; set; }

        [JsonProperty(PropertyName = "hits")]
        public int Hits { get; set; }

        [JsonProperty(PropertyName = "locked")]
        public bool Locked { get; set; }

        public SessionV1()
        {
            
        }

    }
}

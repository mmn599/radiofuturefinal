using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class UserStateV1
    {
        public UserStateV1()
        {
            Time = 0;
            PlayerState = 0;
            QueuePosition = -1;
        }

        [JsonProperty]
        public int Time { get; set; }

        [JsonProperty]
        public int QueuePosition { get; set; }

        [JsonProperty]
        public int PlayerState { get; set; }

        [JsonProperty]
        public bool Waiting { get; set; }
    }
}

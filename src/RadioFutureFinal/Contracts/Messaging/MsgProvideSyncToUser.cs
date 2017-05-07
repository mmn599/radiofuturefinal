using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class MsgProvideSyncToUser
    {
        [JsonProperty]
        public UserStateV1 userState { get; set; }

        [JsonProperty]
        public int userIdRequestor { get; set; }
    }
}

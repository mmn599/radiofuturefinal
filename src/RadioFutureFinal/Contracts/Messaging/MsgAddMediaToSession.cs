using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class MsgAddMediaToSession
    {
        [JsonProperty]
        public MediaV1 media { get; set; }
    }
}

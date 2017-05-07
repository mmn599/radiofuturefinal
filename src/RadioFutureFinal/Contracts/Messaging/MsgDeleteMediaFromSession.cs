using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class MsgDeleteMediaFromSession
    {
        [JsonProperty]
        public int mediaId { get; set; }
    }
}

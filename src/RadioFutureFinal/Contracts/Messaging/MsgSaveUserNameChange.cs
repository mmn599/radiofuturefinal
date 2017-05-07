using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class MsgSaveUserNameChange
    {
        [JsonProperty]
        public int userId { get; set; }

        [JsonProperty]
        public string newName { get; set; }
    }
}

﻿using Newtonsoft.Json;

namespace RadioFutureFinal.Contracts
{
    public class WsMessage
    {
        [JsonProperty(Required = Required.Always)]
        public string Action { get; set; }

        public SessionV1 Session { get; set; }

        public MediaV1 Media { get; set; }

        public UserV1 User { get; set; }
    }
}

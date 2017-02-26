using Newtonsoft.Json;

namespace RadioFutureFinal.Contracts
{
    public class WsMessage
    {
        [JsonProperty]
        public string Action { get; set; }

        [JsonProperty]
        public SessionV1 Session { get; set; }

        [JsonProperty]
        public MediaV1 Media { get; set; }

        [JsonProperty]
        public UserV1 User { get; set; }
    }
}

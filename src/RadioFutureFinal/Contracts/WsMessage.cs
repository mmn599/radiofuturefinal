using Newtonsoft.Json;

namespace RadioFutureFinal.Contracts
{
    public class WsMessage
    {
        [JsonProperty(Required = Required.Always)]
        public string Action { get; set; }

        [JsonProperty(Required = Required.AllowNull)]
        public SessionV1 Session { get; set; }

        [JsonProperty(Required = Required.AllowNull)]
        public MediaV1 Media { get; set; }

        [JsonProperty(Required = Required.AllowNull)]
        public UserV1 User { get; set; }
    }
}

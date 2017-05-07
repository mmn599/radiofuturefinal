using Newtonsoft.Json;

namespace RadioFutureFinal.Contracts
{
    public class MsgChatMessage
    {
        [JsonProperty]
        public string chatMessage { get; set; }

        [JsonProperty]
        public string userName { get; set; }
    }
}

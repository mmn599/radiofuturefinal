using Newtonsoft.Json;

namespace RadioFutureFinal.Contracts
{
    public class SessionHistoryV1
    {
        [JsonProperty] 
        public int SessionHistoryId { get; set; }

        [JsonProperty] 
        public int SessionID { get; set; }

        [JsonProperty] 
        public string Name { get; set; }

        [JsonProperty] 
        public string URL { get; set; }
    }
}

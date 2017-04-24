using Newtonsoft.Json;

namespace RadioFutureFinal.Contracts
{
    public class MyUserV1
    {
        [JsonProperty]
        public int Id { get; set; }

        [JsonProperty]
        public string Name { get; set; }

        [JsonProperty] 
        public UserState State { get; set; }
    }
}

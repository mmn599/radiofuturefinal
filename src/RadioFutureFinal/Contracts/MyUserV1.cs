using Newtonsoft.Json;
using System.Collections.Generic;

namespace RadioFutureFinal.Contracts
{
    public class MyUserV1
    {
        public MyUserV1()
        {
            State = new UserStateV1();
            PriorSessions = new List<SessionHistoryV1>();
        }

        [JsonProperty]
        public int Id { get; set; }

        [JsonProperty]
        public string Name { get; set; }

        [JsonProperty] 
        public UserStateV1 State { get; set; }

        [JsonProperty] 
        public bool Temporary { get; set; }

        [JsonProperty]
        public List<SessionHistoryV1> PriorSessions { get; set; }

        [JsonProperty]
        public int FacebookId { get; set; }
    }
}

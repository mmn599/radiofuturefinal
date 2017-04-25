using Newtonsoft.Json;

namespace RadioFutureFinal.Contracts
{
    public class MyUserV1
    {
        public MyUserV1()
        {
            // TODO: this is wacky
            State = new UserState();
        }

        [JsonProperty]
        public int Id { get; set; }

        [JsonProperty]
        public string Name { get; set; }

        [JsonProperty] 
        public UserState State { get; set; }
    }
}

using Newtonsoft.Json;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class UserV1
    {
        [JsonProperty]
        public int Id { get; set; }

        [JsonProperty]
        public string Name { get; set; }

        [JsonProperty]
        public int VideoTime { get; set; }

        [JsonProperty]
        public int QueuePosition { get; set; }

        [JsonProperty]
        public int YTPlayerState { get; set; }

        [JsonProperty]
        public bool Waiting { get; set; }

        public UserV1()
        {

        }

        public UserV1(User user)
        {
            Id = user.UserID;
            Name = user.Name;
            VideoTime = user.VideoTime;
            QueuePosition = user.QueuePosition;
            YTPlayerState = user.YTPlayerState;
            Waiting = user.Waiting;
        }
    }
}

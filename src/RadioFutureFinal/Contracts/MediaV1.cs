using Newtonsoft.Json;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class MediaV1
    {
        [JsonProperty]
        public int Id { get; set; }

        [JsonProperty]
        public int UserID { get; set; }

        [JsonProperty]
        public string UserName { get; set; }

        [JsonProperty]
        public string YTVideoID { get; set; }

        [JsonProperty]
        public int Likes { get; set; }

        [JsonProperty]
        public int Dislikes { get; set; }

        [JsonProperty]
        public string ThumbURL { get; set; }

        public MediaV1()
        {

        }

        public MediaV1(Media media)
        {
            Id = media.MediaID;
            UserID = media.UserID;
            UserName = media.UserName;
            YTVideoID = media.YTVideoID;
            Likes = media.Likes;
            Dislikes = media.Dislikes;
            ThumbURL = media.ThumbURL;
        }
    }
}

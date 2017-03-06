using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Models
{
    public class Media
    {
        public int MediaID { get; set; }
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string YTVideoID { get; set; }
        public int Likes { get; set; }
        public int Dislikes { get; set; }
        public string ThumbURL { get; set; }

        public Media()
        {

        }

        public Media(MediaV1 media)
        {
            MediaID = media.Id;
            UserID = media.UserID;
            UserName = media.UserName;
            YTVideoID = media.YTVideoID;
            Likes = media.Likes;
            Dislikes = media.Dislikes;
            ThumbURL = media.ThumbURL;
        }
    }
}

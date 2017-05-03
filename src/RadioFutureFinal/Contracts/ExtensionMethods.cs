using RadioFutureFinal.Models;
using System.Collections.Generic;

namespace RadioFutureFinal.Contracts
{
    public static class ExtensionMethods
    {
        public static MyUser ToModel(this MyUserV1 user)
        {
            var userModel = new MyUser()
            {
                MyUserId = user.Id,
                Name = user.Name,
            };
            return userModel;
        }

        public static MyUserV1 ToContract(this MyUser user)
        {
            var userContract = new MyUserV1()
            {
                Id = user.MyUserId,
                Name = user.Name,
                State = new UserState()
                {
                    Time = 0,
                    QueuePosition = -1,
                    PlayerState = 0,
                    Waiting = true
                }
            };
            return userContract;
        }

        public static SessionV1 ToContract(this Session session)
        {
            var sessionContract = new SessionV1()
            {
                Id = session.SessionID,
                Name = session.Name,
                Users = new List<MyUserV1>(),
                Queue = new List<MediaV1>()
            };
            foreach (var user in session.Users)
            { 
                sessionContract.Users.Add(user.ToContract());
            }
            foreach(var media in session.Queue)
            {
                sessionContract.Queue.Add(media.ToContract());
            }
            return sessionContract;
        }

        public static Media ToModel(this MediaV1 media)
        {
            var mediaModel = new Media()
            {
                MediaID = media.Id,
                UserID = media.UserId,
                UserName = media.UserName,
                YTVideoID = media.YTVideoID,
                Title = media.Title,
                ThumbURL = media.ThumbURL,
                MP3Source = media.MP3Source,
                OGGSource = media.OGGSource
            };
            return mediaModel;
        }

        public static MediaV1 ToContract(this Media media)
        {
            var mediaContract = new MediaV1()
            {
                Id = media.MediaID,
                UserId = media.UserID,
                UserName = media.UserName,
                YTVideoID = media.YTVideoID,
                ThumbURL = media.ThumbURL,
                Title = media.Title,
                MP3Source = media.MP3Source,
                OGGSource = media.OGGSource
            };
            return mediaContract;
        }

    }
}

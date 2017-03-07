using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public static class ExtensionMethods
    {
        public static User ToModel(this UserV1 user)
        {
            var userModel = new User()
            {
                UserID = user.Id,
                Name = user.Name,
                VideoTime = user.VideoTime,
                QueuePosition = user.QueuePosition,
                YTPlayerState = user.YTPlayerState,
                Waiting = user.Waiting
            };
            return userModel;
        }

        public static UserV1 ToContract(this User user)
        {
            var userContract = new UserV1()
            {
                Id = user.UserID,
                Name = user.Name,
                VideoTime = user.VideoTime,
                QueuePosition = user.QueuePosition,
                YTPlayerState = user.YTPlayerState,
                Waiting = user.Waiting
            };
            return userContract;
        }

        public static SessionV1 ToContract(this Session session)
        {
            var sessionContract = new SessionV1()
            {
                Id = session.SessionID,
                Name = session.Name,
                Users = new List<UserV1>(),
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

        public static MediaV1 ToContract(this Media media)
        {
            var mediaContract = new MediaV1()
            {
                Id = media.MediaID,
                UserID = media.UserID,
                UserName = media.UserName,
                YTVideoID = media.YTVideoID,
                Likes = media.Likes,
                Dislikes = media.Dislikes,
                ThumbURL = media.ThumbURL
            };
            return mediaContract;
        }

    }
}

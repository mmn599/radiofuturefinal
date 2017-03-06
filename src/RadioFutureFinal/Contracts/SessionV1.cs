using Newtonsoft.Json;
using RadioFutureFinal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Contracts
{
    public class SessionV1
    {
        [JsonProperty]
        public int Id { get; set; }

        [JsonProperty]
        public string Name { get; set; }

        [JsonProperty]
        public List<UserV1> Users { get; set; }

        [JsonProperty]
        public List<MediaV1> Queue { get; set; }

        public SessionV1()
        {
            
        }

        public SessionV1(Session session)
        {
            Id = session.SessionID;
            Name = session.Name;
            Users = new List<UserV1>();
            foreach(var user in session.Users)
            {
                Users.Add(new UserV1(user));
            }
            Queue = new List<MediaV1>();
            foreach(var media in session.Queue)
            {
                Queue.Add(new MediaV1(media));
            }
        }
    }
}

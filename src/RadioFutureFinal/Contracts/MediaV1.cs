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
        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [JsonProperty(PropertyName = "title")]
        public string Title { get; set; }

        [JsonProperty(PropertyName = "thumbURL")]
        public string ThumbURL { get; set; }

        [JsonProperty(PropertyName = "mp3Source")]
        public string MP3Source { get; set; }

        [JsonProperty(PropertyName = "oggSource")]
        public string OGGSource { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string Description { get; set; }

        [JsonProperty(PropertyName = "show")]
        public string Show { get; set; }
    }
}

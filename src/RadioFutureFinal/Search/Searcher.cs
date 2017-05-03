using Microsoft.Extensions.Configuration;
using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace RadioFutureFinal.Search
{
    public class Searcher
    {
        const string BASE_AUDIO_PATH = "https://www.audiosear.ch";
        const string OAUTH_PATH = "/oauth/token";
        const string API_PATH = "/api";
        const string EPISODE_QUERY_PATH = "/search/episodes/";

        bool _ready;
        string _audiosearchId;
        string _audiosearchSecret;
        string _audioToken;
        HttpClient _client;

        public Searcher(IConfigurationRoot config)
        {
            _ready = false;
            _audiosearchId = config.GetValue<string>("AudioAPIKey");
            _audiosearchSecret = config.GetValue<string>("AudioSecret");
            _client = new HttpClient();
        }

        public async Task init()
        {
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(BASE_AUDIO_PATH + OAUTH_PATH),
                Method = HttpMethod.Post
            };

            var unencoded = string.Format("{0}:{1}", _audiosearchId, _audiosearchSecret);
            var encoded = Convert.ToBase64String(ASCIIEncoding.ASCII.GetBytes(unencoded));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", encoded);

            var keyValues = new List<KeyValuePair<string, string>>();
            keyValues.Add(new KeyValuePair<string, string>("grant_type", "client_credentials"));
            request.Content = new FormUrlEncodedContent(keyValues);

            var response = await _client.SendAsync(request);
            string responseBody = await response.Content.ReadAsStringAsync();
            dynamic json = Newtonsoft.Json.JsonConvert.DeserializeObject(responseBody);
            _audioToken = json.access_token;
            _ready = true;
        }

        public async Task<List<MediaV1>> searchPodcasts(string query, int page)
        {
            if(_ready)
            {
                _client.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "request");
                var encodedQuery = System.Net.WebUtility.UrlEncode(query);
                var request = new HttpRequestMessage()
                {
                    RequestUri = new Uri(BASE_AUDIO_PATH + API_PATH + EPISODE_QUERY_PATH + encodedQuery + "?size=5&from=" + (5*page).ToString()),
                    Method = HttpMethod.Get
                };
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _audioToken);

                var response = await _client.SendAsync(request);
                var responseBody = await response.Content.ReadAsStringAsync();
                dynamic json = Newtonsoft.Json.JsonConvert.DeserializeObject(responseBody);

                var mediaResults = new List<MediaV1>();
                var results = json.results;
                foreach(var result in results)
                {
                    var media = new MediaV1();
                    media.Title = result.title;
                    media.MP3Source = result.audio_files[0].mp3;
                    media.ThumbURL = result.show_image_urls.thumb;
                    media.Description = result.description;
                    mediaResults.Add(media); 
                }

                return mediaResults;
            }
            else
            {
                throw new Exception();
            }
        }

    }
}

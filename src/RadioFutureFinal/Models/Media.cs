namespace RadioFutureFinal.Models
{
    public class Media
    {
        public int MediaID { get; set; }
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string YTVideoID { get; set; }
        public string Title { get; set; }
        public string ThumbURL { get; set; }
        public string MP3Source { get; set; }
        public string OGGSource { get; set; }

        public Media()
        {

        }
    }
}

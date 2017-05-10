namespace RadioFutureFinal.Models
{
    public class Media
    {
        public int MediaID { get; set; }
        public string Title { get; set; }
        public string ThumbURL { get; set; }
        public string MP3Source { get; set; }
        public string OGGSource { get; set; }
        public string Description { get; set; }
        public string Show { get; set; }

        public Media()
        {

        }
    }
}

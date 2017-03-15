namespace PP2.Server.Models
{
    public class User : Dal.IDocument
    {
        public string id { get; set; }
        public string ExternalId { get; set; }
        public string Name { get; set; }
        public int Coins { get; set; }
        public int Gold { get; set; }
        public int Dust { get; set; }
        public int HP { get; set; }
        public int Exp { get; set; }
        public int AtrPts { get; set; }
        public int LastLevel { get; set; }

        public override string ToString() => $"[Id: {ExternalId}, {Name}]";
    }
}
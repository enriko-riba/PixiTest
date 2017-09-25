namespace PP2.Server.Models
{
    public class UserData
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Coins { get; set; }
        public int Gold { get; set; }
        public int Dust { get; set; }
        public int HP { get; set; }
        public int Exp { get; set; }
        public int AtrPts { get; set; }
        public int LastLevel { get; set; }

        public override string ToString() => $"[Id: {Id}, UserId: {UserId}, LastLevel: {LastLevel}, HP: {HP}]";
    }
}
namespace PP2.Server.Models
{
    public class UserDataBindingModel
    {
        public string ExternalId { get; set; }
        public int Coins { get; set; }
        public int Gold { get; set; }
        public int Dust { get; set; }
        public int HP { get; set; }
        public int Exp { get; set; }
        public int AtrPts { get; set; }
        public int LastLevel { get; set; }

        public override string ToString() => $"ExtrenalId: {ExternalId}, LastLevel: {LastLevel}, Coins: {Coins}, Gold: {Gold}, Dust: {Dust}, Exp: {Exp}";
    }
}
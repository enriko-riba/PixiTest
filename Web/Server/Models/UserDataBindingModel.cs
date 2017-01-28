namespace PP2.Server.Models
{
    public class UserDataBindingModel
    {
        public string ExternalId { get; set; }
        public int Gold { get; set; }
        public int Dust { get; set; }
        public int LastLevel { get; set; }

        public override string ToString() => $"ExtrenalId: {ExternalId}, LastLevel: {LastLevel}, Gold: {Gold}, Dust: {Dust}";
    }
}
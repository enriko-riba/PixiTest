namespace PP2.Server.Models
{
    public class UserLogin
    {
        public int Id { get; set; }
        public string ExternalId { get; set; }
        public int ServiceId { get; set; }
        public int UserId { get; set; }

        public override string ToString() => $"[Id: {Id}, ExternalId: '{ExternalId}', ServiceId: {ServiceId}, UserId:, {UserId}]";
    }
}
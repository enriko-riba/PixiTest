namespace PP2.Server.Models
{
    /// <summary>
    /// User profile data sent to clients.
    /// </summary>
    public class UserDto 
    {
        public string Name { get; set; }
        public int Coins { get; set; }
        public int Gold { get; set; }
        public int Dust { get; set; }
        public int HP { get; set; }
        public int Exp { get; set; }
        public int AtrPts { get; set; }
        public int LastLevel { get; set; }
    }
}
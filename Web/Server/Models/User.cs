namespace PP2.Server.Models
{
    public class User 
    {
        public int Id { get; set; }
        
        public string Name { get; set; }
       

        public override string ToString() => $"[Id: {Id}, Name: {Name}]";
    }
}
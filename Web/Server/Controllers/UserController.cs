namespace PP2.Server.Controllers
{
    #region usings
    using Dal;
    using Models;
    using System.Web.Http;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Collections.Generic;
    #endregion


    public class UserController : ApiController
    {
        private DocumentDBFactory docDbFactory;

        public UserController(DocumentDBFactory docDbFactory)
        {
            this.docDbFactory = docDbFactory;
        }


        /// <summary>
        /// Checks if user exists, creates a new user and returns user game data.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        [Route("api/user/login")]
        [HttpGet]
        public async Task<User> Login(string id, string name)
        {
            User user = null;
            try
            {
                // get user
                var docDb = await docDbFactory.CreateDB("testDB");
                var qry = docDb.CreateQuery<User>("realm").Where(u => u.ExternalId == id);
                user = qry.AsEnumerable().FirstOrDefault();

                //  insert user 
                if(user == null)
                {
                    user = new User() { ExternalId = id, Name = name, Gold = 0, LastLevel = 0 };
                    await docDb.InsertDocumentAsync("realm", user);
                }
                return user;
            }
            catch (System.Exception ex)
            {
                throw;
            }
        }
    }
}

namespace PP2.Server.Controllers
{
    #region usings
    using Dal;
    using Models;
    using System.Web.Http;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Collections.Generic;
    using log4net;
    #endregion

    public class UserController : ApiController
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(UserController));

        private DocumentDBFactory docDbFactory;

        public UserController(DocumentDBFactory docDbFactory)
        {
            this.docDbFactory = docDbFactory;
        }

        /// <summary>
        /// Saves the user data.
        /// </summary>
        /// <param name="model"></param>
        [Route("api/user/save")]
        [HttpPost]
        public async Task<IHttpActionResult> SaveUserData([FromBody]UserDataBindingModel model)
        {
            try
            {
                log.InfoFormat("model: {0}", model);

                if (model == null)
                {
                    return BadRequest("model");
                }
                if (string.IsNullOrWhiteSpace(model.ExternalId))
                {
                    ModelState.AddModelError("ExternalId", "ExternalId is required");
                    return BadRequest(ModelState);
                }

                // get user
                var docDb = await docDbFactory.CreateDB("testDB");
                var qry = docDb.CreateQuery<User>("realm").Where(u => u.ExternalId == model.ExternalId);
                User user = qry.AsEnumerable().FirstOrDefault();

                //  insert user 
                if (user != null)
                {
                    user.LastLevel = model.LastLevel;
                    user.Gold = model.Gold;
                    user.Coins = model.Coins;
                    user.Dust = model.Dust;
                    user.Exp = model.Exp;
                    user.HP = model.HP;
                    user.AtrPts = model.AtrPts;
                    await docDb.SaveDocumentAsync("realm", user);
                }
                else
                {
                    log.WarnFormat("ExternalId: {0} not found in DB", model.ExternalId);
                    throw new System.ArgumentException("mode.ExternalId not found");
                }
                return Ok(user);
            }
            catch (System.Exception ex)
            {
                log.Error(ex);
                throw;
            }
        }

        /// <summary>
        /// Returns user game data.
        /// </summary>
        /// <param name="id"></param>
        [Route("api/user/data")]
        [HttpGet]
        public async Task<User> GetUserData(string id)
        {
            User user = null;
            try
            {
                // get user
                var docDb = await docDbFactory.CreateDB("testDB");
                var qry = docDb.CreateQuery<User>("realm").Where(u => u.ExternalId == id);
                user = qry.AsEnumerable().FirstOrDefault();
                return user;
            }
            catch (System.Exception ex)
            {
                log.Error(ex);
                throw;
            }
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
                if (user == null)
                {
                    user = new User() { ExternalId = id, Name = name, Gold = 0, LastLevel = 0 };
                    await docDb.InsertDocumentAsync("realm", user);
                }
                return user;
            }
            catch (System.Exception ex)
            {
                log.Error(ex);
                throw;
            }
        }
    }
}

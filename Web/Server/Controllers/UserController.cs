namespace PP2.Server.Controllers
{
    #region usings
    using log4net;
    using Models;
    using System.Threading.Tasks;
    using System.Web.Http;
    #endregion

    public class UserController : ApiController
    {
        private const int PP2_SERVICE_ID = 1;
        private static readonly ILog log = LogManager.GetLogger(typeof(UserController));
        private MyDatabase db = new MyDatabase();

        //private DocumentDBFactory docDbFactory;

        //public UserController(DocumentDBFactory docDbFactory)
        //{
        //    this.docDbFactory = docDbFactory;
        //}

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
                var userLogin = db.First<UserLogin>("WHERE ExternalId = @0", model.ExternalId);
                var data = db.First<UserData>("WHERE UserId = @0", userLogin.UserId);

                //  insert user 
                if (data != null)
                {                    
                    data.LastLevel = model.LastLevel;
                    data.Gold = model.Gold;
                    data.Coins = model.Coins;
                    data.Dust = model.Dust;
                    data.Exp = model.Exp;
                    data.HP = model.HP;
                    data.AtrPts = model.AtrPts;
                    await db.UpdateAsync(data);
                }
                else
                {
                    log.WarnFormat("ExternalId: {0} not found in DB", model.ExternalId);
                    throw new System.ArgumentException("mode.ExternalId not found");
                }
                return Ok(data);
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
        public UserDto GetUserData(string id)
        {
            try
            {
                var userLogin = db.First<UserLogin>("WHERE ExternalId = @0", id);
                var user = db.First<User>("WHERE Id = @0", userLogin.UserId);
                var data = db.First<UserData>("WHERE UserId = @0", userLogin.UserId);
                UserDto dto = new UserDto()
                {
                    Name = user.Name,
                    AtrPts = data.AtrPts,
                    Coins = data.Coins,
                    Dust = data.Coins,
                    Exp = data.Exp,
                    Gold = data.Gold,
                    HP = data.HP,
                    LastLevel = data.LastLevel
                };
                return dto;
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
        public async Task<UserDto> Login(string id, string name)
        {
            try
            {
                User user = null;
                UserData data = null;
                UserLogin userLogin = db.FirstOrDefault<UserLogin>("WHERE ExternalId = @0", id);
                
                //  insert user 
                if (userLogin == null)
                {
                    db.BeginTransaction();
                    user = new User() { Name = name, };
                    await db.InsertAsync(user);

                    userLogin = new UserLogin() { ExternalId = id, UserId = user.Id, ServiceId = PP2_SERVICE_ID };
                    await db.InsertAsync(userLogin);

                    data = new UserData() {UserId = user.Id, HP = 100, Dust = 100 };
                    await db.InsertAsync(data);
                    db.CompleteTransaction();
                }
                else
                {
                    user = db.First<User>("WHERE Id = @0", userLogin.UserId);
                    data = db.First<UserData>("WHERE UserId = @0", userLogin.UserId);
                }

                UserDto dto = new UserDto()
                {
                    Name = user.Name,
                    AtrPts = data.AtrPts,
                    Coins = data.Coins,
                    Dust = data.Coins,
                    Exp = data.Exp,
                    Gold = data.Gold,
                    HP = data.HP,
                    LastLevel = data.LastLevel
                };
                return dto;
            }
            catch (System.Exception ex)
            {
                log.Error(ex);
                throw;
            }
        }
    }
}

using System.Web.Http;

namespace PixiTest.Controllers
{
    public class UserController : ApiController
    {
        [Route("api/user/login")]
        public void Login(string email, string pwd)
        {

        }
    }
}

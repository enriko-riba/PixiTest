using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
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

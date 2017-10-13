using System.Web.Http;

namespace PP2
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.EnableSystemDiagnosticsTracing();

            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            //-------------------------
            //  SimpleInjector setup
            //-------------------------
            //IocConfig.Register();
        }
    }
}

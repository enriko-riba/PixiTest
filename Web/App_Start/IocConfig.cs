using SimpleInjector;
using SimpleInjector.Integration.WebApi;
using System.Web.Http;

namespace PP2
{
    public static class IocConfig
	{
		public static void Register()
		{
			var container = new Container();
			container.Options.DefaultScopedLifestyle = new WebApiRequestLifestyle();
			//container.Register<Authentication.TokenCache>(Lifestyle.Singleton);
			//container.Register<Server.Dal.DocumentDBFactory>(Lifestyle.Singleton);

            // This is an extension method from the integration package.
            container.RegisterWebApiControllers(GlobalConfiguration.Configuration);

			GlobalConfiguration.Configuration.DependencyResolver = new SimpleInjectorWebApiDependencyResolver(container);
			container.Verify();
        }
	}
}
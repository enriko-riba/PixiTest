import * as ko from "knockout";
import * as Sammy from "sammy";

/**
*   1.0.0   initial release
*   1.0.1   overall fixes and route related features
*   1.0.2   added route parameters support
*   1.0.3   added onDeactivate
*   1.0.4   workaround for issues with canceling navigation and onDeactivate
*   1.0.5   added field IsDebugToConsoleEnabled
*   1.0.6   fix for calculating # from url in virtual application
*   1.0.7   Route ctor: the vm parameter is now a union type, it can be a factory function returning the vm or a vm
*   1.0.8   Reverted Route ctor as we lack a mechanism for delay loading dependencies so the whole point of constructor functions is pointless
*
*   2.0.0   major changes:
*               - main SPA pages are now ko components not templates
*               - html layout (see home/Index.cshtml) renders the main page view as a component
*               - changed route registration (the route ctor has only hash and component name)
*               - no need to have a viewmodel property per page and import all VM's in main (the
*                 application gets incrementally loaded as the user navigates through routes)
*               - component VM's are now plain objects instead of old IRouteViewModels (no need
*                 to implement activate/onafterrender/deactivate functions)
*
*   2.1.0   routing fixes, navigation cancellation support (via postbox) and cleanup
*   2.1.1	IE fixes related to location's randomly not set when using Sammy
*   2.1.2	ViewModelBase is now auto registering OnDeactivate
*   2.1.3	added generic error-handler component and demonstrated how to inject JS variables inside _Layout
*   2.1.4	added parameter overload for Application.registerComponent()
*   2.1.5	minor tweaks and large GUI changes (added Demos menu, datatables, switch etc)
*   2.1.6	minor tweaks and error dialog changes
*   2.1.7	added support for setting the oldRoute (previous route) inside the postbox handler for edge cases where
*           the application was not entered via the expected main route and the handler function wants to redirect
*           to the entry point or some other route
*   2.1.8   added support for navigating back to a default route (via RouteCheck and canContinue) if the app started
*           with invalide route (route not found)
*   2.1.9   added overloads for registering components with:
*                           registerComponent(name:string) -> (uses default folders),
*                           registerComponent({ componentName: ..., templatePath: ..., vmPath: ...}) -> explicit syntaxt
*                           registerComponent({componentName: ...}) -> only name (uses folder Name/Name for both VM and html)
*/
export var SPA_VERSION = "2.1.9";

interface ConsoleStyles {
    greenFill: string,
    greenFill_light: string,
    red: string,
    redFill: string,
}
var consoleStyle: ConsoleStyles = {
    greenFill: "color:#222;background:#1c1;border: solid 3px #1c1;",
    greenFill_light: "color:#0;background:#5f5; border: solid 3px #5f5;",
    red: "color:#f11;",
    redFill: "color:#fff;background:#f55; border: solid 3px #f55;",
};

export interface IRoute {

    /**
    *   The component name. This is the name of the component used for rendering the routes main view.
    */
    component: string;

    /**
    *   Custom data attached to the route.
    */
    tag: any;

    /**
    *   Routes target url (includes named parameter names in route).
    *   Note: this member is set via the route's constructor and must not be changed during runtime.
    */
    href: string;

    /**
    *   Active flag, returns true if the route is active else false.
    *   Note: this observable is set by the router.
    */
    isActive: KnockoutObservable<boolean>;

    /**
    *   Routes hash part of the url (includes parameter values in route).
    *   Note: this member is set by the router.
    */
    hash: string;

    /**
    *   Route parameters collection.
    *   Note: this member is set by the router.
    */
    params: any;

	/**
    *   Route path.
    *   Note: this member is set by the router.
    */
    path: string;
}


/**
*   Basic route implementation
*/
export class Route implements IRoute {

    public isActive: KnockoutObservable<boolean>;
    public href: string;
    public component: string;
    public hash: string;
    public tag: any;
    public path: string;

    /**
    *   Placeholder for route parameters
    */
    public params: any;

    /**
    * Creates a new Route instance.
    *
    * @param href the target url
    * @param component holds the name of the component rendered when the route is active
    * @param tag optional parameter, can hold any application specific value
    */
    constructor(href: string, component: string, tag?: any) {
        this.href = href;
        this.component = component;
        this.tag = tag;
        this.isActive = ko.observable<boolean>(false);

        var start = href.indexOf("#");
        if (start) {
            this.hash = href.substr(start);
        } else {
            this.hash = href;
        }
    }
}

/**
 * The SPA routing component.
 */
export class Router {
    private routes = ko.observableArray<IRoute>();
    public IsDebugToConsoleEnabled = false;

    /**
    *   The route invoked if a requested route is not found
    */
    private notFoundRoute: IRoute;

    /**
    *   Stops the routing system by unloading Sammy.
    */
    public Stop = () => {
        var sammyRouting: Sammy.Application = Sammy();
        sammyRouting.unload();
    }

    /**
    *   Applies the configured routes and starts the routing system.
    *   @param routeUrl an optional route to start the application.
    */
    public Run = (routeUrl?: string) => {
        var sammyRouting: Sammy.Application = Sammy();
        var self = this;

        //  for each route apply a sammy.get route
        ko.utils.arrayForEach(this.routes(), (route: IRoute) => {
            sammyRouting.get(route.href, function () {

                if (self.IsDebugToConsoleEnabled)
                    console.info("%cactivating route " + route.href + ', path: ' + this.path, consoleStyle.greenFill);

                var oldRoute = self.ActiveRoute();
                var oldPath = oldRoute ? oldRoute.path : "";

                //	unless its a primitive type ko will mutate the observable 
                //	even if the new value is equal to the old one, a manual 
                //	comparison by reference ensures only changes cause Activate.
                //	We must also take care for same routes but different parameters.
                if ((route !== oldRoute) || (oldPath !== this.path)) {

                    //	allow for canceling the navigation via canContinue parameter
                    if (!self.RouteNavigationCheck(oldRoute, route)) {
                        console.info("%croute deactivation forbidden (canContinue == false)!", consoleStyle.redFill);
                        window.location.hash = oldRoute.hash;
                        return false;
                    }

                    if (self.IsDebugToConsoleEnabled && oldRoute)
                        console.info("%cdeactivated route " + oldRoute.hash, consoleStyle.redFill);

                    //	if here, the route change is allowed
                    route.params = this.params;
                    route.path = this.path;

                    //  extract the url's hash part
                    var path = this.path as string;
                    var start = path.indexOf("#");
                    if (start) {
                        route.hash = path.substr(start);
                    } else {
                        route.hash = path;
                    }

                    self.SetActiveRoute(route);
                }

                console.info("");
            });
        });

        //  handle notFound route
        sammyRouting.notFound = (verb, route) => {
            console.error("%croute not found:%c " + route, "color:#fff;background:#700;", "color:#fff;background:#707;");

            //	get the current route & fire onDeactivate
            var canContinue = true;
            if (self.ActiveRoute() !== self.notFoundRoute) {
                canContinue = self.RouteNavigationCheck(self.ActiveRoute(), self.notFoundRoute);
            }
            if (!canContinue) {
                if (window.location.hash !== self.ActiveRoute().hash)
                    window.location.hash = self.ActiveRoute().hash;
                return false;
            }

            if (self.notFoundRoute) {
                var params = {};
                params['route'] = route;
                self.notFoundRoute.params = params;
                this.UpdateActiveFlags(self.notFoundRoute);
                this.ActiveRoute(self.notFoundRoute);
            }
        };

        //  start routing
        sammyRouting.run(routeUrl);
    }

    /**
    *   Returns the internal routes array.
    */
    public GetRoutes() {
        return this.routes();
    }

    /**
    *   Adds a new route.
    *   @param route the route to be added
    */
    public AddRoute = (route: IRoute) => {
        this.routes.push(route);
    }

    /**
    *   Sets the route that gets invoked if a requested route is not found.
    */
    public SetNotFoundRoute = (route: IRoute) => {
        var start = route.href.indexOf("#");
        if (start) {
            route.hash = route.href.substr(start);
        } else {
            route.hash = route.href;
        }
        this.notFoundRoute = route;
    }

    /**
    *   Returns the active route.
    */
    public ActiveRoute = ko.observable<IRoute>();

	/**
    *   Notifies subscribers of route navigation.
	*	Returns true if the navigation is allowed.
    */
    private RouteNavigationCheck = (oldRoute: IRoute, newRoute: IRoute): boolean => {
        var navigationData = {
            canContinue: true,
            nextRoute: newRoute,
            currentRoute: oldRoute
        };
        ko.postbox.publish("route:navigation", navigationData);

        //  special case handling for navigation check on app entry where no previous route exists,
        //  here we allow assigning the previous route inside the postbox handler and thus update oldRoute
        if (!oldRoute && navigationData.currentRoute) {
            oldRoute = navigationData.currentRoute;
            this.SetActiveRoute(oldRoute);
        }
        return navigationData.canContinue;
    }

    /**
    *   Activates the given route.
    */
    private SetActiveRoute = (route: IRoute) => {
        //if (this.IsDebugToConsoleEnabled)
        //    console.info("SetActiveRoute('" + route.href + "' params: " + route.params + ")...");

        if (route) {
            //if (this.IsDebugToConsoleEnabled)
            //    console.info("Changing view to '" + route.href + "', component name: '" + route.component + "'");

            this.UpdateActiveFlags(route);

            if (window.location.hash !== route.hash)
                window.location.hash = route.hash;
            this.ActiveRoute(route);
        }
        else {
            window.location.hash = "#";
        }

        if (this.IsDebugToConsoleEnabled)
            console.info("%cactivated route " + route.href + ', path: ' + "', component name: '" + route.component + "', params: " + route.params, consoleStyle.greenFill);
    }

    /**
    *   Removes the active flag from all routes except the newRoute.
    */
    private UpdateActiveFlags = (newActiveRoute: IRoute) => {
        ko.utils.arrayForEach(this.routes(), (currentRoute: IRoute) => {
            currentRoute.isActive(currentRoute === newActiveRoute);
        });

        if (this.notFoundRoute) {
            this.notFoundRoute.isActive(this.notFoundRoute === newActiveRoute)
        }
    }
}

/**
*   The base for the SPA application, extend your main vm from this class.
*   The Application object exposes a router object of type KnockoutObservable<Router>. 
*/
export class Application {
    /**
    *   The router component is basically a dictionary of registered routes. 
    */
    public router: KnockoutObservable<Router>;

    protected ActiveRoute = ko.pureComputed(() => {
        return this.router().ActiveRoute();
    });

    private isDebugToConsoleEnabled = false;

    /**
    *   Creates a new Application instance.
    */
    constructor() {
        this.router = ko.observable(new Router());
        console.info("%c 💜 💛 ❤ \t%cSPAN SPA Application created!\t%c\t ❤ 💜 💛", consoleStyle.red, consoleStyle.greenFill, consoleStyle.red);
        console.info("\t\t\t%cFramework version:%c\t" + SPA_VERSION + "\t\t", consoleStyle.greenFill, consoleStyle.greenFill_light);
    }

    /**
    *   Enables or disables most console log messages.
    */
    protected IsDebugToConsoleEnabled = (isEnabled: boolean) => {
        this.isDebugToConsoleEnabled = isEnabled;
        this.router().IsDebugToConsoleEnabled = this.isDebugToConsoleEnabled;
    }

    /**
    * Helper for easy component registration.
    * You can override this to setup custom rules for template/vm folder locations.
    *
    * @param componentName the name of the component to be registered
    */
    protected registerComponent = (componentNameOrOptions: string | ComponentOptions) => {
        var templateName = "text!app/";
        var vmName = "./app/";
        var componentName: string;

        if (typeof componentNameOrOptions === "string") {
            componentName = componentNameOrOptions as string;
            templateName += "_templates/" + componentName + "/" + componentName + ".html";
            vmName += componentName + "/" + componentName;
        } else {
            componentName = componentNameOrOptions.componentName;

            //  if not explicitly set the default path is <ComponentName>/<ComponentName>
            var defaultPath = componentName + '/' + componentName;
            templateName += (componentNameOrOptions.templatePath || defaultPath) + ".html";
            vmName += componentNameOrOptions.vmPath || defaultPath;
        }

        ko.components.register(componentName, {
            template: { require: templateName },
            viewModel: { require: vmName }
        });
    }
}

export interface ComponentOptions {
    componentName: string;
    templatePath?: string;
    vmPath?: string
}

export interface RouteNavigationData {
    canContinue: boolean;
    nextRoute: IRoute;
    currentRoute: IRoute;
}

/**
*	Base class for route viewmodels.
*	Note: this class just takes care of correct OnDeactivate() handling and disposing postbox subscription.
*/
export class ViewModelBase {
    private postboxSubscription: any;

    constructor() {
        this.SubscribeOnDeactivate();
    }

    private OnDeactivateHandler(data: RouteNavigationData) {
        this.OnDeactivate(data);
        if (data.canContinue)
            this.UnsubscribeOnDeactivate();
    }

	/**
	 *	Stops listening to on deactivate messages.
	 */
    protected UnsubscribeOnDeactivate() {
        if (this.postboxSubscription) {
            this.postboxSubscription.dispose();
            this.postboxSubscription = undefined;
        }
    }

	/**
	 *	Starts listening to on deactivate messages.
	 */
    protected SubscribeOnDeactivate = () => {
        this.postboxSubscription = ko.postbox.subscribe("route:navigation", this.OnDeactivateHandler, this);
    }

	/**
	 *	Triggered when on deactivate messages arrives, override to implement behavior.
	 */
    protected OnDeactivate(data: RouteNavigationData) {
    }
}
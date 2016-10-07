import * as ko from "knockout";
import {Application, Router, Route, SPA_VERSION} from "app/_framework/SpaApplication";
import * as Sammy from "sammy"; 


/**
*   Main view model
*/
class Main extends Application {
    
    //  for debug info on/off (used in Home/Index.cshtml)
    private showActiveRoute = ko.observable(true);
    private showApplication = ko.observable(false);
    
    //  for app footer binding
    private spa_version = SPA_VERSION;
    private build_version = "0.1.0";

    constructor() {
        super();
        console.debug('main ctor...');
        this.IsDebugToConsoleEnabled(true);

        this.registerComponent({ componentName: "Home" });
        this.registerComponent({ componentName: "Demo" });
        this.registerComponent({ componentName: "Route-not-found" });


        //  generic ajax result error handler (displays modal dialog with ModelState errors/exceptions)
        this.registerComponent({
            componentName: 'error-handler',
            templatePath: 'Common/error-handler',
            vmPath:'Common/error-handler'
        }); 

        //  for ease of use grab the application router 
        var r = this.router();

        //  define application routes
        r.AddRoute(new Route('/', 'Home'));
        r.AddRoute(new Route('#home', 'Home'));
        r.AddRoute(new Route('#demo', 'Demo'));

        r.SetNotFoundRoute(new Route('#notfound', 'Route-not-found'));
        r.Run('/#home');
    }   
}

//  create instance and export - singleton!
export var vm = new Main();
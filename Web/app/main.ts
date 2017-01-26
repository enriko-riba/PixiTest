import {Application, Router, Route, SPA_VERSION} from "app/_framework/SpaApplication";
import * as ko from "knockout";
/**
*   Main view model
*/
class Main extends Application {
    
    //  for app footer binding
    private spa_version = SPA_VERSION;
    private build_version = "0.1.0";
    public isLoadingVisible = ko.observable(true);

    constructor() {
        super();
        console.debug('main ctor...');
        this.IsDebugToConsoleEnabled(true);

        this.registerComponent({ componentName: "Login" });
        this.registerComponent({ componentName: "Home" });
        this.registerComponent({
            componentName: "Game",
            templatePath: 'Game/Start',
            vmPath: 'Game/Start'});
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
        r.AddRoute(new Route('#login', 'Login'));
        r.AddRoute(new Route('#pp2', 'Game'));
        r.SetNotFoundRoute(new Route('#notfound', 'Route-not-found'));
        r.Run('/#home');
    }   
}

//  create instance and export - singleton!
export var vm = new Main();
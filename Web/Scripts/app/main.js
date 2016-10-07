var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "app/_framework/SpaApplication"], function (require, exports, ko, SpaApplication_1) {
    "use strict";
    /**
    *   Main view model
    */
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            _super.call(this);
            //  for debug info on/off (used in Home/Index.cshtml)
            this.showActiveRoute = ko.observable(true);
            this.showApplication = ko.observable(false);
            //  for app footer binding
            this.spa_version = SpaApplication_1.SPA_VERSION;
            this.build_version = "0.1.0";
            console.debug('main ctor...');
            this.IsDebugToConsoleEnabled(true);
            this.registerComponent({ componentName: "Home" });
            this.registerComponent({ componentName: "Demo" });
            this.registerComponent({ componentName: "Route-not-found" });
            //  generic ajax result error handler (displays modal dialog with ModelState errors/exceptions)
            this.registerComponent({
                componentName: 'error-handler',
                templatePath: 'Common/error-handler',
                vmPath: 'Common/error-handler'
            });
            //  for ease of use grab the application router 
            var r = this.router();
            //  define application routes
            r.AddRoute(new SpaApplication_1.Route('/', 'Home'));
            r.AddRoute(new SpaApplication_1.Route('#home', 'Home'));
            r.AddRoute(new SpaApplication_1.Route('#demo', 'Demo'));
            r.SetNotFoundRoute(new SpaApplication_1.Route('#notfound', 'Route-not-found'));
            r.Run('/#home');
        }
        return Main;
    }(SpaApplication_1.Application));
    //  create instance and export - singleton!
    exports.vm = new Main();
});
//# sourceMappingURL=main.js.map
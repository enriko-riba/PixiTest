define(["require", "exports", "knockout", "app/main"], function (require, exports, ko, main_1) {
    "use strict";
    /**
     * VM for route not found page.
     * Just exposes the notFoundRoute string.
     */
    var Route404 = (function () {
        function Route404() {
            this.notFoundRouteName = ko.observable("");
            var router = main_1.vm.router();
            this.notFoundRouteName(router.ActiveRoute().params['route']);
        }
        return Route404;
    }());
    return Route404;
});
//# sourceMappingURL=Route-not-found.js.map
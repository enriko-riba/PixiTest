import * as ko from "knockout";
import {vm} from "app/main";

declare var baseUrl: string;

/**
 * VM for route not found page.
 * Just exposes the notFoundRoute string.
 */
class Route404 {
    private notFoundRouteName = ko.observable("");
    constructor() {
        var router = vm.router();
        this.notFoundRouteName(router.ActiveRoute().params['route']);
    }
}
export = Route404;

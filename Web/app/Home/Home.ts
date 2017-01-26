import { vm } from "app/main";
import * as Global from "app/Game/Global";

class HomeVM {
    constructor() {
        vm.isLoadingVisible(false);
        if (Global.UserInfo.id === 0) {
            window.location.hash = "#login";
        }
    }
}

export = HomeVM;
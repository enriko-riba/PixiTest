import { vm } from "app/main";
import * as FB from "FB";
import * as Global from "app/Game/Global";
import * as ko from "knockout";

class LoginVM {
    private isLoginVisible = ko.observable<boolean>(false);

    constructor() {
        vm.isLoadingVisible(false);
        this.isLoginVisible(false);
        
        FB.init({
            appId: '354002631665440',
            status: true,
            cookie: true,
            xfbml: true,
            logging: true,
            version: 'v2.8'
        });

        //FB.Event.subscribe('auth.login', this.checkLoginResponse);
        //FB.AppEvents.logPageView();

        /**
         *  Check if the user is logged in. If yes the userdata is fetched with redirect to #home.
         *  If the user is not logged in, the FB.login() is invoked and control is transfered to checkLoginResponse().
         */
        FB.getLoginStatus((response) => {
            console.log("FB.getLoginStatus()", response);
            if (response.status === 'connected') {
                Global.UserInfo.id = response.authResponse.userID;
                this.getUserData();
            } else {
                FB.login(this.checkLoginResponse);
                this.isLoginVisible(true);
                FB.Event.subscribe('auth.login', this.checkLoginResponse);
            }
        });
    }

    /*
     *  Checks the login response, if user is logged in the userdata is fetched with redirect to #home.
     *  If the user is not logged in the login button is dispayed.
     */
    private checkLoginResponse = (response) => {
        console.log("checkLoginResponse()", response);
        if (response.status === 'connected') {
            FB.Event.unsubscribe('auth.login', this.checkLoginResponse);
            Global.UserInfo.id = response.authResponse.userID;
            this.getUserData();
        }
        // else if (response.status === 'not_authorized') {
        //    this.isLoginVisible(true);
        //    FB.Event.subscribe('auth.login', this.checkLoginResponse);
        //} else {
        //    this.isLoginVisible(true);
        //    FB.Event.subscribe('auth.login', this.checkLoginResponse);
        //}

        //FB.getLoginStatus((response) => {
            
        //}, true);
    }

    private getUserData = () => {
        console.log("getUserData()", window.location.origin);
        FB.api('/me', (response: any) => {
            console.log("getUserData() repsonse", response);
            Global.UserInfo.name = response.name;
            (window as any).location = window.location.origin + "#home";
        });
    }
}

function login() {
    console.log("login()", window.location.origin);
    // window.open("https://www.facebook.com/v2.8/dialog/oauth?client_id=354002631665440&redirect_uri=" + window.location.origin + "#home");
    window.location.href = "https://www.facebook.com/v2.8/dialog/oauth?client_id=354002631665440&redirect_uri=" + window.location.origin + "#home";
}
export = LoginVM;
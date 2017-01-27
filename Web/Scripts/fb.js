define(['app/Game/Global', 'facebook'], function (Global) {

    FB.init({
        appId: '354002631665440',
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v2.8'
    });
    FB.AppEvents.logPageView();

    FB.getLoginStatus(function (response) {
        console.log("getLoginStatus()", response);

        if (response.status === 'connected') {
            // the user is logged in and has authenticated your
            // app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed
            // request, and the time the access token 
            // and signed request each expire
            Global.UserInfo.id = response.authResponse.userID;            
            getUserData();            
        } else if (response.status === 'not_authorized') {
            // the user is logged in to Facebook, 
            // but has not authenticated your app
            login();
        } else {
            // the user isn't logged in to Facebook.
            login();
        }
    });

    function getUserData() {
        console.log("getUserData()", window.location.origin);
        FB.api('/me', function (response) {            
            console.log("getUserData() repsonse", response);
            Global.UserInfo.name = response.name;
            window.location = window.location.origin + "#home";
        });
    }
});

function login() {
    console.log("login()", window.location.origin);
    window.location.href = "https://www.facebook.com/v2.8/dialog/oauth?client_id=354002631665440&redirect_uri=" + window.location.origin;
}
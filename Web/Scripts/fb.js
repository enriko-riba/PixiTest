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
        console.log(response);

        if (response.status === 'connected') {
            // the user is logged in and has authenticated your
            // app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed
            // request, and the time the access token 
            // and signed request each expire
            Global.UserInfo.id = response.authResponse.userID;            
            getUserData();            

        } else if (response.status === 'not_authorized') {
            $(".login-message").text("You must authorize the PP2 application!");
            $(".fb-login-area").show();

            //FB.login();
            // the user is logged in to Facebook, 
            // but has not authenticated your app
        } else {
            // the user isn't logged in to Facebook.
            $(".login-message").text("You must login into Facebook first!");
            $(".fb-login-area").show();
            //FB.login();
        }
    });
    function getUserData() {
        FB.api('/me', function (response) {
            $(".login-message").text('Hello ' + response.name);
            window.location.hash = "#home";
        });
    }
});

function login() {
    window.location.href = "https://www.facebook.com/v2.8/dialog/oauth?client_id=354002631665440&redirect_uri=" + window.location.origin;
}
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Loader DOM element, depends on html having an element with class 'loader'
     */
    var dlg;
    var overlay;
    /**
     *  Placeholder for the authentication header.
     *  Note: do not use directly, the RegisterBearerToken() will set up the authentication.
     */
    exports.authenticationHeader = undefined;
    function RegisterBearerToken(token) {
        exports.authenticationHeader = {};
        exports.authenticationHeader["Authorization"] = "Bearer " + token;
    }
    exports.RegisterBearerToken = RegisterBearerToken;
    /**
    *   Starts a ajax GET request.
    */
    function GetWithData(url, data, successCallback, failCallback, showSpinner) {
        if (showSpinner === void 0) { showSpinner = true; }
        if (showSpinner) {
            ShowLoadingSpinner();
        }
        var promise = $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            url: url,
            data: data,
            headers: exports.authenticationHeader === undefined ? null : exports.authenticationHeader,
        });
        promise.done(function (data, textStatus) {
            if (successCallback)
                successCallback(data, textStatus);
            HideLoadingSpinner();
        }).fail(function (data, textStatus) {
            if (failCallback)
                failCallback(data, textStatus);
            HideLoadingSpinner();
        });
    }
    exports.GetWithData = GetWithData;
    /**
    *   Starts a ajax GET request.
    *   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
    */
    function Get(url, successCallback, failCallback, showSpinner) {
        if (showSpinner === void 0) { showSpinner = true; }
        if (showSpinner) {
            ShowLoadingSpinner();
        }
        var promise = $.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            headers: exports.authenticationHeader === undefined ? null : exports.authenticationHeader,
        });
        promise.done(function (data, textStatus) {
            if (successCallback)
                successCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        }).fail(function (data, textStatus) {
            if (failCallback)
                failCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        });
    }
    exports.Get = Get;
    /**
    *   Starts a ajax POST request.
    *   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
    */
    function Post(url, data, successCallback, failCallback, showSpinner) {
        if (showSpinner === void 0) { showSpinner = true; }
        if (showSpinner) {
            ShowLoadingSpinner();
        }
        data = JSON.stringify(data);
        var promise = $.ajax({
            type: "POST",
            accepts: "application/json",
            contentType: "application/json; charset=utf-8",
            data: data,
            url: url,
            headers: exports.authenticationHeader === undefined ? null : exports.authenticationHeader,
        });
        promise.done(function (data, textStatus) {
            if (successCallback)
                successCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        }).fail(function (data, textStatus) {
            if (failCallback)
                failCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        });
    }
    exports.Post = Post;
    /**
    *   Starts a ajax PUT request.
    *   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
    */
    function Put(url, data, successCallback, failCallback, showSpinner) {
        if (showSpinner === void 0) { showSpinner = true; }
        if (showSpinner) {
            ShowLoadingSpinner();
        }
        data = JSON.stringify(data);
        var promise = $.ajax({
            type: "PUT",
            accepts: "application/json",
            contentType: "application/json; charset=utf-8",
            data: data,
            url: url,
            headers: exports.authenticationHeader === undefined ? null : exports.authenticationHeader,
        });
        promise.done(function (data, textStatus) {
            if (successCallback)
                successCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        }).fail(function (data, textStatus) {
            if (failCallback)
                failCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        });
    }
    exports.Put = Put;
    /**
    *   Starts a ajax Delete request.
    *   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
    */
    function Delete(url, successCallback, failCallback, showSpinner) {
        if (showSpinner === void 0) { showSpinner = true; }
        if (showSpinner) {
            ShowLoadingSpinner();
        }
        var promise = $.ajax({
            type: "DELETE",
            url: url,
            headers: exports.authenticationHeader === undefined ? null : exports.authenticationHeader,
        });
        promise.done(function (data, textStatus) {
            if (successCallback)
                successCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        }).fail(function (data, textStatus) {
            if (failCallback)
                failCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        });
    }
    exports.Delete = Delete;
    /**
    *   Starts a ajax Delete request.
    *   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
    */
    function DeleteWithData(url, data, successCallback, failCallback, showSpinner) {
        if (showSpinner === void 0) { showSpinner = true; }
        if (showSpinner) {
            ShowLoadingSpinner();
        }
        var promise = $.ajax({
            type: "DELETE",
            url: url,
            data: data,
            headers: exports.authenticationHeader === undefined ? null : exports.authenticationHeader,
        });
        promise.done(function (data, textStatus) {
            if (successCallback)
                successCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        }).fail(function (data, textStatus) {
            if (failCallback)
                failCallback(data, textStatus);
            if (showSpinner)
                HideLoadingSpinner();
        });
    }
    exports.DeleteWithData = DeleteWithData;
    /**
     *Takes multiple 'urls' for ajax calls and returns response data when every promise is resolved.
     * @param successCallback
     * @param failCallback
     * @param showSpinner
     * @param urls
     */
    function GetMultiple(successCallback, failCallback, showSpinner) {
        if (showSpinner === void 0) { showSpinner = true; }
        var urls = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            urls[_i - 3] = arguments[_i];
        }
        if (showSpinner) {
            ShowLoadingSpinner();
        }
        var promises = [];
        for (var _a = 0, urls_1 = urls; _a < urls_1.length; _a++) {
            var url = urls_1[_a];
            var promise = $.ajax({
                type: "GET",
                dataType: "json",
                url: url,
                headers: exports.authenticationHeader === undefined ? null : exports.authenticationHeader
            });
            promises.push(promise);
        }
        ;
        $.when.apply($, promises)
            .then(function () {
            if (showSpinner)
                HideLoadingSpinner();
            if (successCallback) {
                var result = [];
                for (var _i = 0, _a = arguments; _i < _a.length; _i++) {
                    var arg = _a[_i];
                    result.push(arg[0]);
                }
                successCallback(result);
            }
        }, function (jQueryXHR, textStatus) {
            if (showSpinner)
                HideLoadingSpinner();
            if (failCallback) {
                failCallback(jQueryXHR, textStatus);
            }
        });
    }
    exports.GetMultiple = GetMultiple;
    var spinnerCount = 0;
    var lastTimeoutHandle = undefined;
    function ShowLoadingSpinner() {
        if (dlg === undefined) {
            dlg = $('.loader');
            overlay = $('.overlay');
        }
        spinnerCount++;
        if (lastTimeoutHandle === undefined) {
            lastTimeoutHandle = setTimeout(function () {
                dlg.show();
                overlay.show();
            }, 100);
        }
    }
    exports.ShowLoadingSpinner = ShowLoadingSpinner;
    function HideLoadingSpinner() {
        if (dlg === undefined) {
            dlg = $('.loader');
            overlay = $('.overlay');
        }
        if (--spinnerCount <= 0) {
            if (lastTimeoutHandle) {
                clearTimeout(lastTimeoutHandle);
            }
            lastTimeoutHandle = undefined;
            dlg.hide();
            overlay.hide();
        }
    }
    exports.HideLoadingSpinner = HideLoadingSpinner;
});
//# sourceMappingURL=AjaxHelper.js.map
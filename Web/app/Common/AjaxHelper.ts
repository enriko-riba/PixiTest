import * as ko from "knockout";

/**
 * Loader DOM element, depends on html having an element with class 'loader'
 */
var dlg: JQuery;
var overlay: JQuery;

/**
 *  Placeholder for the authentication header.
 *  Note: do not use directly, the RegisterBearerToken() will set up the authentication.
 */
export var authenticationHeader: { [key: string]: any; } = undefined;


export function RegisterBearerToken(token: string) {
    authenticationHeader = {};
    authenticationHeader["Authorization"] = "Bearer " + token;
}

/**
*   Starts a ajax GET request. 
*/
export function GetWithData(url: string, data: any, successCallback?: (data: any, textStatus: string) => void, failCallback?: (jqXHR: any, textStatus: string) => void, showSpinner = true) {

    if (showSpinner) {
        ShowLoadingSpinner();
    }


    var promise = $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: url,
        data: data,
        headers: authenticationHeader === undefined ? null : authenticationHeader,

    });

    promise.done((data: any, textStatus) => {
        if (successCallback)
            successCallback(data, textStatus);
        HideLoadingSpinner();
    }).fail((data: any, textStatus) => {
        if (failCallback)
            failCallback(data, textStatus);
        HideLoadingSpinner();
    });
}

/**
*   Starts a ajax GET request. 
*   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
*/
export function Get(url: string, successCallback?: (data: any, textStatus: string) => void, failCallback?: (jqXHR: any, textStatus: string) => void, showSpinner = true) {
    if (showSpinner) {
        ShowLoadingSpinner();
    }

    var promise = $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: authenticationHeader === undefined ? null : authenticationHeader,
    });

    promise.done((data: any, textStatus) => {
        if (successCallback)
            successCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    }).fail((data: any, textStatus) => {
        if (failCallback)
            failCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    });
}


/**
*   Starts a ajax POST request. 
*   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
*/
export function Post(url: string, data: any, successCallback?: (data: any, textStatus: string) => void, failCallback?: (data: any, textStatus: string) => void, showSpinner = true) {

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
        headers: authenticationHeader === undefined ? null : authenticationHeader,
    });
    promise.done((data: any, textStatus) => {
        if (successCallback)
            successCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    }).fail((data: any, textStatus) => {
        if (failCallback)
            failCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    });

}

/**
*   Starts a ajax PUT request. 
*   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
*/
export function Put(url: string, data: any, successCallback?: (data: any, textStatus: string) => void, failCallback?: (data: any, textStatus: string) => void, showSpinner = true) {

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
        headers: authenticationHeader === undefined ? null : authenticationHeader,
    });

    promise.done((data: any, textStatus) => {
        if (successCallback)
            successCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    }).fail((data: any, textStatus) => {
        if (failCallback)
            failCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    });
}

/**
*   Starts a ajax Delete request. 
*   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
*/
export function Delete(url: string, successCallback?: (data: any, textStatus: string) => void, failCallback?: (jqXHR: any, textStatus: string) => void, showSpinner = true) {
    if (showSpinner) {
        ShowLoadingSpinner();
    }
    var promise = $.ajax({
        type: "DELETE",
        url: url,
        headers: authenticationHeader === undefined ? null : authenticationHeader,
    });

    promise.done((data: any, textStatus) => {
        if (successCallback)
            successCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    }).fail((data: any, textStatus) => {
        if (failCallback)
            failCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    });
}

/**
*   Starts a ajax Delete request. 
*   Note: the first DOM element with the class 'loader' is displayed as a modal dialog until the ajax returns.
*/
export function DeleteWithData(url: string, data: any, successCallback?: (data: any, textStatus: string) => void, failCallback?: (jqXHR: any, textStatus: string) => void, showSpinner = true) {
    if (showSpinner) {
        ShowLoadingSpinner();
    }
    var promise = $.ajax({
        type: "DELETE",
        url: url,
        data: data,
        headers: authenticationHeader === undefined ? null : authenticationHeader,
    });

    promise.done((data: any, textStatus) => {
        if (successCallback)
            successCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    }).fail((data: any, textStatus) => {
        if (failCallback)
            failCallback(data, textStatus);
        if (showSpinner) HideLoadingSpinner();
    });
}


/**
 *Takes multiple 'urls' for ajax calls and returns response data when every promise is resolved.
 * @param successCallback
 * @param failCallback
 * @param showSpinner
 * @param urls
 */
export function GetMultiple<T>(successCallback?: (data: Array<any>) => void, failCallback?: (jqXHR: JQueryXHR, textStatus: string) => void, showSpinner = true, ...urls: Array<string>) {
    if (showSpinner) {
        ShowLoadingSpinner();
    }

    var promises: Array<JQueryPromise<T>> = [];
    for (let url of urls) {
        let promise = $.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            headers: authenticationHeader === undefined ? null : authenticationHeader
        });
        promises.push(promise);
    };

    $.when.apply($, promises)
        .then(
        function () {
            if (showSpinner) HideLoadingSpinner();
            if (successCallback) {
                let result = [];
                for (let arg of <any>arguments) {
                    result.push(arg[0]);
                }
                successCallback(result);
            }
        },
        function (jQueryXHR: JQueryXHR, textStatus: string) {
            if (showSpinner) HideLoadingSpinner();
            if (failCallback) {
                failCallback(jQueryXHR, textStatus);
            }
        });
}

var spinnerCount = 0;
var lastTimeoutHandle = undefined;

export function ShowLoadingSpinner() {
    if (dlg === undefined) {
        dlg = $('.loader');
        overlay = $('.overlay');
    }

    spinnerCount++;

    if (lastTimeoutHandle === undefined) {       //  important: set handle only if undefined
        lastTimeoutHandle = setTimeout(() => {
            dlg.show();
            overlay.show();
        }, 100);
    }
}

export function HideLoadingSpinner() {

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
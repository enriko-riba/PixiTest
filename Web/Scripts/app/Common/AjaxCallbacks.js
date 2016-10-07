define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Use this method directly only in special cases, otherwise use FailResponseHandler wrapper.
     * @param jqXHR
     * @param textStatus
     */
    function FailCallback(jqXHR, textStatus) {
        var responseText = "";
        var status;
        var modelstate = jqXHR.responseJSON.ModelState;
        for (var property in modelstate) {
            responseText += modelstate[property];
        }
        if (jqXHR.status == ResponseStatus.Unauthorized) {
            status = ResponseStatus.Unauthorized;
            //redirects to login
            window.location.replace('/Account');
        }
        else if (jqXHR.status == ResponseStatus.BadRequest) {
            responseText += jqXHR.responseJSON.Message;
            status = ResponseStatus.BadRequest;
            var modelState = jqXHR.responseJSON.ModelState;
        }
        else if (jqXHR.status == ResponseStatus.InternalServerError) {
            status = ResponseStatus.InternalServerError;
            responseText = jqXHR.responseJSON.ExceptionMessage + " " + jqXHR.responseJSON.Message + " " + jqXHR.statusText + " ";
        }
        else {
            responseText = "Unknown error has occured.";
        }
        return {
            ResponseText: responseText,
            Status: status
        };
    }
    exports.FailCallback = FailCallback;
    function SuccessCallback(successText) {
        var response = successText;
        return response;
    }
    exports.SuccessCallback = SuccessCallback;
    /**
     * To preserve 'this' 'bind' (or equivalent function) has to be used when calling this function.
     * @param jqXHR
     * @param textStatus
     */
    function FailResponseHandler(jqXHR, textStatus) {
        var response = FailCallback(jqXHR, textStatus);
        if (response.Status != ResponseStatus.Unauthorized) {
            this.responseDialog().SetResponse(response.ResponseText);
            this.responseDialog().Show();
        }
    }
    exports.FailResponseHandler = FailResponseHandler;
    (function (ResponseStatus) {
        ResponseStatus[ResponseStatus["BadRequest"] = 400] = "BadRequest";
        ResponseStatus[ResponseStatus["Unauthorized"] = 401] = "Unauthorized";
        ResponseStatus[ResponseStatus["InternalServerError"] = 500] = "InternalServerError";
    })(exports.ResponseStatus || (exports.ResponseStatus = {}));
    var ResponseStatus = exports.ResponseStatus;
});
//# sourceMappingURL=AjaxCallbacks.js.map
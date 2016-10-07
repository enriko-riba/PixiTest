define(["require", "exports", "knockout", "jquery"], function (require, exports, ko, $) {
    "use strict";
    /**
     * View model for Server response modal dialog. Has to be used with 'component-modal' dialog with custom html body
     * that has message, xhrStatus and responseText observables bound to it.
     */
    var ErrorResponseModal = (function () {
        function ErrorResponseModal() {
            var _this = this;
            this.IsVisible = ko.observable(false);
            this.SubmitText = ko.observable("Ok");
            this.StackTraceText = ko.observable("Show details");
            this.showStackTraceInfo = ko.observable(false);
            this.ShowStackTraceBtn = ko.observable(false);
            this.message = ko.observableArray([]);
            this.responseText = ko.observable("");
            this.xhrStatus = ko.observable("");
            this.stackTrace = ko.observable("");
            this.SetResponse = function (message, responseStatus, responseText, status, stackTrace) {
                _this.message(message);
                _this.responseText(responseText);
                _this.xhrStatus(status);
                _this.stackTrace(stackTrace);
                if (responseStatus === ResponseStatus.InternalServerError)
                    _this.ShowStackTraceBtn(true);
                else
                    _this.ShowStackTraceBtn(false);
                _this.showStackTraceInfo(false);
            };
            this.SubmitClick = function () {
                _this.IsVisible(false);
                _this.promise.resolve(true);
            };
            this.ShowStackTrace = function () {
                _this.showStackTraceInfo(!_this.showStackTraceInfo());
                if (_this.showStackTraceInfo())
                    _this.StackTraceText("Hide details");
                else
                    _this.StackTraceText("Show details");
            };
            this.CopyToClipboard = function () {
                var copyTextarea = document.querySelector('#stackTrace');
                copyTextarea.select();
                var successful = document.execCommand('copy');
            };
            this.Title = ko.observable("Error");
        }
        ErrorResponseModal.prototype.Show = function () {
            this.IsVisible(true);
            this.promise = $.Deferred();
            return this.promise;
        };
        ErrorResponseModal.prototype.Hide = function () {
            this.IsVisible(false);
            this.promise.resolve(false);
        };
        return ErrorResponseModal;
    }());
    /**
     * Creates global ajaxError event that handles parsed XHR response message and prints it into modal dialog.
     * If additional logic is required callback function has to be passed in.
     */
    var ErrorHandler = (function () {
        function ErrorHandler(params) {
            var _this = this;
            this.params = params;
            /**
            * Parses JQueryXHR object to response text and status.
            */
            this.ParsejqXHRMessage = function (jqXHR) {
                var responseText = [];
                var status;
                var stackTrace;
                var modelstate = jqXHR.responseJSON ? jqXHR.responseJSON.ModelState : null;
                if (modelstate) {
                    for (var state in modelstate) {
                        var response = state + " : ";
                        response += modelstate[state][0][modelstate[state][0].length - 1] === '.' ? modelstate[state] + " " : modelstate[state] + ". ";
                        responseText.push(response);
                    }
                }
                if (jqXHR.status == ResponseStatus.Unauthorized) {
                    status = jqXHR.statusText + " - HTTP status code: " + ResponseStatus.Unauthorized;
                }
                else if (jqXHR.status == ResponseStatus.BadRequest) {
                }
                else if (jqXHR.status == ResponseStatus.InternalServerError) {
                    responseText.push("Exception message: " + jqXHR.responseJSON.ExceptionMessage);
                    responseText.push("Exception type: " + jqXHR.responseJSON.ExceptionType);
                    responseText.push("Status text: " + jqXHR.statusText);
                    stackTrace = jqXHR.responseJSON.StackTrace;
                }
                else if (jqXHR.status == ResponseStatus.NetworkProblem) {
                    status = "Network problem - HTTP status code: " + ResponseStatus.NetworkProblem;
                    responseText.push("Network problem");
                }
                else if (jqXHR.status == ResponseStatus.NotFound) {
                    status = jqXHR.statusText + " - HTTP status code: " + ResponseStatus.NotFound;
                    if (jqXHR.responseJSON && jqXHR.responseJSON.Message) {
                        responseText.push(jqXHR.responseJSON.Message);
                    }
                }
                else {
                    responseText.push("Unknown error has occurred.");
                }
                return {
                    ResponseText: responseText,
                    Status: status,
                    StackTrace: stackTrace,
                    ResponseStatus: jqXHR.status
                };
            };
            this.customCB = params.callback;
            this.errorDialogModal = new ErrorResponseModal();
            $(document).ajaxError(function (event, request, settings) {
                var parsedMessage = _this.ParsejqXHRMessage(request);
                _this.errorDialogModal.SetResponse(parsedMessage.ResponseText, parsedMessage.ResponseStatus, "", parsedMessage.Status, parsedMessage.StackTrace);
                var promise = _this.errorDialogModal.Show();
                promise.done(function (isOk) {
                    if (_this.customCB) {
                        _this.customCB(request, isOk);
                    }
                });
            });
        }
        /**
        * Used to disable ajax error global event handler.
        */
        ErrorHandler.StopGlobalErrorHandler = function () {
            $.ajaxSetup({
                global: false
            });
        };
        return ErrorHandler;
    }());
    var ResponseStatus;
    (function (ResponseStatus) {
        ResponseStatus[ResponseStatus["NetworkProblem"] = 0] = "NetworkProblem";
        ResponseStatus[ResponseStatus["BadRequest"] = 400] = "BadRequest";
        ResponseStatus[ResponseStatus["Unauthorized"] = 401] = "Unauthorized";
        ResponseStatus[ResponseStatus["NotFound"] = 404] = "NotFound";
        ResponseStatus[ResponseStatus["InternalServerError"] = 500] = "InternalServerError";
    })(ResponseStatus || (ResponseStatus = {}));
    return ErrorHandler;
});
//# sourceMappingURL=error-handler.js.map
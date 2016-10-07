import * as ko from "knockout";
import * as $ from "jquery";

/**
 * View model for Server response modal dialog. Has to be used with 'component-modal' dialog with custom html body
 * that has message, xhrStatus and responseText observables bound to it.
 */
class ErrorResponseModal {

    private IsVisible = ko.observable(false);
    protected Title: KnockoutObservable<string>;
    protected SubmitText = ko.observable("Ok");
    protected StackTraceText = ko.observable("Show details");
    private showStackTraceInfo = ko.observable(false);
    private ShowStackTraceBtn = ko.observable(false);
    private promise: JQueryDeferred<boolean>;
    private message = ko.observableArray<string>([]);
    private responseText = ko.observable<string>("");
    private xhrStatus = ko.observable("");
    private stackTrace = ko.observable<string>("");

    constructor() {
        this.Title = ko.observable("Error");
    }
    public SetResponse = (message: Array<string>, responseStatus: ResponseStatus, responseText?: string, status?: string, stackTrace?: string) => {
        this.message(message);
        this.responseText(responseText);
        this.xhrStatus(status);
        this.stackTrace(stackTrace);
        if (responseStatus === ResponseStatus.InternalServerError) this.ShowStackTraceBtn(true);
        else this.ShowStackTraceBtn(false);
        this.showStackTraceInfo(false);

    }
    public Show() {
        this.IsVisible(true);
        this.promise = $.Deferred();
        return this.promise;
    }
    public Hide() {
        this.IsVisible(false);
        this.promise.resolve(false);
    }
    public SubmitClick = () => {
        this.IsVisible(false);
        this.promise.resolve(true);
    }
    public ShowStackTrace = () => {
        this.showStackTraceInfo(!this.showStackTraceInfo());
        if (this.showStackTraceInfo()) this.StackTraceText("Hide details");
        else this.StackTraceText("Show details");
    };
    private CopyToClipboard = () => {
        var copyTextarea = document.querySelector('#stackTrace');
        (copyTextarea as any).select();
        var successful = document.execCommand('copy');
    }
}

/**
 * Creates global ajaxError event that handles parsed XHR response message and prints it into modal dialog.
 * If additional logic is required callback function has to be passed in.
 */
class ErrorHandler {

    private errorDialogModal: ErrorResponseModal;
    private customCB: (xhr: JQueryXHR, promiseCallbackValue: boolean) => void;

    constructor(private params: ICustomCallback) {
        this.customCB = params.callback;
        this.errorDialogModal = new ErrorResponseModal();

        $(document).ajaxError((event, request, settings) => {

            var parsedMessage = this.ParsejqXHRMessage(request);

            this.errorDialogModal.SetResponse(parsedMessage.ResponseText, parsedMessage.ResponseStatus, "", parsedMessage.Status, parsedMessage.StackTrace);
            var promise: JQueryDeferred<boolean> = this.errorDialogModal.Show();

            promise.done((isOk: boolean) => {
                if (this.customCB) {
                    this.customCB(request, isOk);
                }
            });
        });
    }

    /**
    * Used to disable ajax error global event handler.
    */
    public static StopGlobalErrorHandler = () => {
        $.ajaxSetup({
            global: false
        });
    };

    /**
    * Parses JQueryXHR object to response text and status.
    */
    private ParsejqXHRMessage = (jqXHR: JQueryXHR): IFailResponse => {
        var responseText: Array<string> = [];
        var status: string;
        var stackTrace: string;

        var modelstate = jqXHR.responseJSON ? jqXHR.responseJSON.ModelState : null;
        if (modelstate) {
            for (let state in modelstate) {
                let response = `${state} : `;
                response += modelstate[state][0][modelstate[state][0].length - 1] === '.' ? `${modelstate[state]} ` : `${modelstate[state]}. `
                responseText.push(response);
            }
        }
        if (jqXHR.status == ResponseStatus.Unauthorized) {
            status = `${jqXHR.statusText} - HTTP status code: ${ResponseStatus.Unauthorized}`;
        }
        else if (jqXHR.status == ResponseStatus.BadRequest) {            
        }
        else if (jqXHR.status == ResponseStatus.InternalServerError) {
            responseText.push(`Exception message: ${jqXHR.responseJSON.ExceptionMessage}`);
            responseText.push(`Exception type: ${jqXHR.responseJSON.ExceptionType}`);
            responseText.push(`Status text: ${jqXHR.statusText}`); 
            stackTrace = jqXHR.responseJSON.StackTrace;
        }
        else if (jqXHR.status == ResponseStatus.NetworkProblem) {
            status = "Network problem - HTTP status code: " + ResponseStatus.NetworkProblem;
            responseText.push("Network problem");
        }
        else if (jqXHR.status == ResponseStatus.NotFound) {
            status = `${jqXHR.statusText} - HTTP status code: ${ResponseStatus.NotFound}`;
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
    }
}

interface IFailResponse {
    ResponseText: Array<string>,
    Status: string,
    StackTrace?: string,
    ResponseStatus: ResponseStatus
}

interface ICustomCallback {
    callback: (xhr?: JQueryXHR, promiseCallbackValue?: boolean) => void;
}

enum ResponseStatus {
    NetworkProblem = 0,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    InternalServerError = 500
}

export = ErrorHandler;

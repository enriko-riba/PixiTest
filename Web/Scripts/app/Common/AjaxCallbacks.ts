/**
 * Use this method directly only in special cases, otherwise use FailResponseHandler wrapper.
 * @param jqXHR
 * @param textStatus
 */
export function FailCallback(jqXHR: JQueryXHR, textStatus: string): IFailResponse {
    var responseText = "";
    var status: ResponseStatus;

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
        responseText = jqXHR.responseJSON.ExceptionMessage + " " + jqXHR.responseJSON.Message + " " + jqXHR.statusText+" ";
    }
    else {
        responseText = "Unknown error has occured.";
    }
    return {
        ResponseText: responseText,
        Status: status
    };
}

export function SuccessCallback(successText: string) {
    var response = successText;
    return response;
}

/**
 * To preserve 'this' 'bind' (or equivalent function) has to be used when calling this function.
 * @param jqXHR
 * @param textStatus
 */
export function FailResponseHandler(jqXHR: JQueryXHR, textStatus: string) {
    var response = FailCallback(jqXHR, textStatus);
    if (response.Status != ResponseStatus.Unauthorized) {
        this.responseDialog().SetResponse(response.ResponseText);
        this.responseDialog().Show();
    }
}



export interface IFailResponse {
    ResponseText: string,
    Status: ResponseStatus
}
export enum ResponseStatus {
    BadRequest = 400,
    Unauthorized = 401,
    InternalServerError = 500
}
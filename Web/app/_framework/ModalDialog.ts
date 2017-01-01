import * as ko from "knockout";

/**
*   Generic modal dialog, usually bound to '..\_templates\component-modal.html'.
*   The body of the dialog is an external template.
*/
export class ModalDialog {
    private IsVisible = ko.observable(false);

    protected Title: KnockoutObservable<string>;
    protected BodyTemplate: KnockoutObservable<string>;
    protected CloseText = ko.observable("Zatvori");
    protected SubmitText = ko.observable("Spremi");
    protected DeleteText = ko.observable("Obriši");
    protected ModalCss: KnockoutObservable<string>;
    protected SubmitClick: () => void;
    protected DeletebtnVisible: KnockoutObservable<boolean>;
    protected CloseBtnVisible = ko.observable(true);

    constructor(title: string = '', bodyTemplate: string = '', cssClass?: string) {
        this.ModalCss = ko.observable(cssClass);
        this.Title = ko.observable(title);
        this.DeletebtnVisible = ko.observable(false);
        this.BodyTemplate = ko.observable(bodyTemplate);
        this.BodyTemplate(bodyTemplate);
    }

    protected CanSubmit = () => {
        return true;
    };

    protected LeftButtonClick = () => {
    };

    protected DeleteButtonClick = () => {

    };

    public Show() {
        console.log(this.IsVisible());

        this.IsVisible(true);

        console.log(this.IsVisible());

    }

    public Hide() {
        this.IsVisible(false);
    }
}
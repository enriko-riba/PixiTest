define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    /**
    *   Generic modal dialog, usually bound to '..\_templates\component-modal.html'.
    *   The body of the dialog is an external template.
    */
    var ModalDialog = (function () {
        function ModalDialog(title, bodyTemplate, cssClass) {
            if (title === void 0) { title = ''; }
            if (bodyTemplate === void 0) { bodyTemplate = ''; }
            this.IsVisible = ko.observable(false);
            this.CloseText = ko.observable("Zatvori");
            this.SubmitText = ko.observable("Spremi");
            this.DeleteText = ko.observable("Obriši");
            this.CloseBtnVisible = ko.observable(true);
            this.CanSubmit = function () {
                return true;
            };
            this.LeftButtonClick = function () {
            };
            this.DeleteButtonClick = function () {
            };
            this.ModalCss = ko.observable(cssClass);
            this.Title = ko.observable(title);
            this.DeletebtnVisible = ko.observable(false);
            this.BodyTemplate = ko.observable(bodyTemplate);
            this.BodyTemplate(bodyTemplate);
        }
        ModalDialog.prototype.Show = function () {
            console.log(this.IsVisible());
            this.IsVisible(true);
            console.log(this.IsVisible());
        };
        ModalDialog.prototype.Hide = function () {
            this.IsVisible(false);
        };
        return ModalDialog;
    }());
    exports.ModalDialog = ModalDialog;
});
//# sourceMappingURL=ModalDialog.js.map
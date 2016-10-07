define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var OverlayVM = (function () {
        function OverlayVM() {
            this.createViewModel = function () { return OverlayVM._instance; };
            this.Show = function () {
                OverlayVM.IsVisible(true);
            };
            this.Hide = function () {
                OverlayVM.IsVisible(false);
            };
            this.Toggle = function () {
                OverlayVM.IsVisible(!OverlayVM.IsVisible());
            };
            this.handleOverlay = ko.computed(function () {
                if (OverlayVM.IsVisible) {
                    var visible = OverlayVM.IsVisible();
                    if (visible) {
                        $(".overlay").css("visibility", "visible");
                        $(".overlay").css("opacity", "1");
                    }
                    else {
                        $(".overlay").css("visibility", "hidden");
                        $(".overlay").css("opacity", "0");
                    }
                }
            });
        }
        OverlayVM._instance = new OverlayVM();
        OverlayVM.IsVisible = ko.observable(false);
        OverlayVM.OverlayText = ko.observable("please wait");
        return OverlayVM;
    }());
    return OverlayVM;
});
//# sourceMappingURL=overlay.js.map
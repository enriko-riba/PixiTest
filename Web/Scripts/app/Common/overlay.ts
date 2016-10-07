import * as ko from "knockout";
import { IOverlay } from "app/Common/IOverlay";

class OverlayVM implements IOverlay{
    public static readonly _instance = new OverlayVM();
    public static readonly IsVisible = ko.observable(false);
    public static readonly OverlayText = ko.observable("please wait");

    public createViewModel = () => OverlayVM._instance;
       

    public Show = () => {
        OverlayVM.IsVisible(true);
    }
    public Hide = () => {
        OverlayVM.IsVisible(false);
    }
    public Toggle = () => {
        OverlayVM.IsVisible(!OverlayVM.IsVisible());
    }

    private handleOverlay = ko.computed(() => {
        if (OverlayVM.IsVisible) {
            var visible = OverlayVM.IsVisible();
            if (visible) {
                $(".overlay").css("visibility", "visible");
                $(".overlay").css("opacity", "1");
            } else {
                $(".overlay").css("visibility", "hidden");
                $(".overlay").css("opacity", "0");
            }
        }
    });
}
export = OverlayVM;

import * as ko from "knockout";

export interface IOverlay {       
    //IsVisible: KnockoutObservable<boolean>;
    //OverlayText: KnockoutObservable<string>;
    Show: () => void;
    Hide: () => void;
    Toggle: () => void;    
}


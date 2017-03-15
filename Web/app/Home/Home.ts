import { vm } from "app/main";
import * as ko from "knockout";
import * as Global from "app/Game/Global";
import * as AjaxHelper from "app/Common/AjaxHelper";

declare var baseUrl: string;

class HomeVM {
    private usr_Name = ko.observable<string>("");
    private usr_GameLevel = ko.observable<string>("");
    private usr_Gold = ko.observable<string>("");
    private usr_Coins= ko.observable<string>("");
    private usr_Dust = ko.observable<string>("");
    private usr_Exp = ko.observable<string>("");
    private usr_HP = ko.observable<string>("");
    private usr_AtrPts = ko.observable<string>("");
    private hasProfileData = ko.observable<boolean>(false);
    private isStartEnabled = ko.observable<boolean>(true);

    constructor() {
        if (Global.stats.id === 0) {
            window.location.hash = "#login";
        } else {

            if (Global.sceneMngr) {
                Global.snd.stopTrack();
                (Global as any).sceneMngr = null;
            }

            vm.isLoadingVisible(false);
            (window as any).baseUrl = window.location.origin;
            this.usr_Name(Global.stats.name);
            this.connectUser(Global.stats.id, Global.stats.name);

        }
    }

    private connectUser(id: number, name: string) {
        let model = { id: id, name: name };
        AjaxHelper.GetWithData(baseUrl + "/api/user/login", model, (data, status) => {
            console.log("connectUser() response", data);

            //  for game logic           
            Global.stats.gameLevel = data.LastLevel;
            

            //  for GUI binding
            this.usr_Name(data.Name);
            this.usr_GameLevel(data.LastLevel);
            this.usr_Gold(data.Gold);
            this.usr_Coins(data.Coins);
            //this.usr_Dust(`${data.Dust}/1000`); //  TODO: reference playerstats formula for max dust
            this.usr_Dust(`${data.Dust}`);
            this.usr_Exp(data.Exp);
            //this.usr_HP(`${data.HP}/${data.MaxHP}`);    //  TODO: reference playerstats formula for max hp
            this.usr_HP(`${data.HP}`);
            this.usr_AtrPts(data.AtrPts);
            this.hasProfileData(true);
        });
    }

    private startGame = () => {
        this.isStartEnabled(false);
        setTimeout(() =>
            window.location.hash = "#pp2",
            200);
    };
}

export = HomeVM;
import { vm } from "app/main";
import * as ko from "knockout";
import * as Global from "app/Game/Global";
import * as AjaxHelper from "app/Common/AjaxHelper";

declare var baseUrl: string;

class HomeVM {
    private usr_Name = ko.observable<string>("");
    private usr_GameLevel = ko.observable<string>("");
    private usr_Gold = ko.observable<string>("");
    private usr_Dust = ko.observable<string>("");
    private usr_MaxHP = ko.observable<string>("");
    private hasProfileData = ko.observable<boolean>(false);
    private isStartEnabled = ko.observable<boolean>(true);

    constructor() {
        if (Global.UserInfo.id === 0) {
            window.location.hash = "#login";
        } else {
            vm.isLoadingVisible(false);
            (window as any).baseUrl = window.location.origin;
            this.usr_Name(Global.UserInfo.name);
            this.connectUser(Global.UserInfo.id, Global.UserInfo.name);
        }
    }

    private connectUser(id: number, name: string) {
        let model = { id: id, name: name };
        AjaxHelper.GetWithData(baseUrl + "/api/user/login", model, (data, status) => {
            console.log("connectUser() response", data);

            //  for game logic
            Global.UserInfo.gold = data.Gold;
            Global.UserInfo.gamelevel = data.LastLevel;
            Global.UserInfo.dust = data.Dust;

            //  for GUI binding
            this.usr_Name(data.Name);
            this.usr_GameLevel(data.LastLevel);
            this.usr_Gold(data.Gold);
            this.usr_Dust(`${data.Dust}/1000`);
            this.usr_MaxHP("120/150");
            this.hasProfileData(true);
        });
    }

    private startGame = () => {
        this.isStartEnabled(false);
        window.location.hash = "#pp2";
    };
}

export = HomeVM;
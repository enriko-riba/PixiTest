import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import { StatType } from "../Player/PlayerStats";
import * as Global from "../Global";
import * as ko from "knockout";

/**
 *   Main character management scene.
 */
export class CharacterScene extends Scene {

    private TEXT_STYLE: PIXI.TextStyleOptions =
    {
        align: "left",
        padding: 0,
        fontSize: "22px",
        fontFamily: Global.fontFamily,
        fill: 0xaaaa13,
        strokeThickness: 3,
        stroke: 0x0f0f2f,
    };

    /**
     *   Creates a new Character scene instance.
     */
    constructor() {
        super("Character");
        this.BackGroundColor = Global.BACK_COLOR;

        this.setup();
    }

    private pointAmount = ko.observable<number>(0);
    private freePoints = ko.observable<number>(0);

    private maxHpPts = ko.observable<number>(0);
    private maxDustPts = ko.observable<number>(0);
    private regenHpPts = ko.observable<number>(0);
    private regenDustPts = ko.observable<number>(0);

    public onActivate = () => {
        this.pointAmount(Global.stats.getStat(StatType.AttributePoints));
        this.freePoints(Global.stats.getStat(StatType.AttributePoints));
    };  

    private setup = () => {

        let HALF_BTN_WIDTH = Global.BTN_WIDTH / 2;
        let BTN_Y = Global.SCENE_HEIGHT - Global.BTN_HEIGHT - (Global.BTN_HEIGHT / 2);


        var txtPoints = new PIXI.Text("0", this.TEXT_STYLE);
        txtPoints.position.set(Global.BTN_WIDTH, Global.BTN_HEIGHT);
        this.addChild(txtPoints);

        var handlAmountChange = ko.computed(() => {
            this.freePoints(this.pointAmount() - this.maxDustPts() - this.maxHpPts() - this.regenDustPts() - this.regenHpPts());
            txtPoints.text = `Points left ${this.freePoints()}/${this.pointAmount()}`;
        });

        //  HP +/-
        BTN_Y = Global.BTN_HEIGHT * 2;
        var txtMaxHp = new PIXI.Text("Max HP", this.TEXT_STYLE);
        txtMaxHp.position.set(HALF_BTN_WIDTH, BTN_Y);
        this.addChild(txtMaxHp);
        var btnAddMaxHp = new Button("assets/_distribute/gui_plus.png", Global.BTN_WIDTH + 120, BTN_Y, 32, 32);
        btnAddMaxHp.onClick = () => this.maxHpPts(this.maxHpPts()+1);
        this.addChild(btnAddMaxHp);

        var btnRemoveMaxHp = new Button("assets/_distribute/gui_minus.png", Global.BTN_WIDTH + 168, BTN_Y, 32, 32);
        btnRemoveMaxHp.onClick = () => this.maxHpPts(this.maxHpPts() - 1);
        this.addChild(btnRemoveMaxHp);
               
        //  Dust +/-
        BTN_Y = Global.BTN_HEIGHT * 3;
        var txtMaxDust = new PIXI.Text("Max Dust", this.TEXT_STYLE);
        txtMaxDust.position.set(HALF_BTN_WIDTH, BTN_Y);
        this.addChild(txtMaxDust);
        var btnAddMaxDust = new Button("assets/_distribute/gui_plus.png", Global.BTN_WIDTH + 120, BTN_Y, 32, 32);
        btnAddMaxDust.onClick = () => this.maxDustPts(this.maxDustPts() + 1);
        this.addChild(btnAddMaxDust);

        var btnRemoveMaxDust = new Button("assets/_distribute/gui_minus.png", Global.BTN_WIDTH + 168, BTN_Y, 32, 32);
        btnRemoveMaxDust.onClick = () => this.maxDustPts(this.maxDustPts() - 1);
        this.addChild(btnRemoveMaxDust);

        //  HP regen +/-
        BTN_Y = Global.BTN_HEIGHT * 4;
        var txtHpRegen = new PIXI.Text("HP regeneration", this.TEXT_STYLE);
        txtHpRegen.position.set(HALF_BTN_WIDTH, BTN_Y);
        this.addChild(txtHpRegen);
        var btnAddHpRegen = new Button("assets/_distribute/gui_plus.png", Global.BTN_WIDTH + 120, BTN_Y, 32, 32);
        btnAddHpRegen.onClick = () => this.regenHpPts(this.regenHpPts() + 1);
        this.addChild(btnAddHpRegen);

        var btnRemoveHpRegen = new Button("assets/_distribute/gui_minus.png", Global.BTN_WIDTH + 168, BTN_Y, 32, 32);
        btnRemoveHpRegen.onClick = () => this.regenHpPts(this.regenHpPts() - 1);
        this.addChild(btnRemoveHpRegen);

        //  Dust regen +/-
        BTN_Y = Global.BTN_HEIGHT * 5;
        var txtDustRegen = new PIXI.Text("Dust regeneration", this.TEXT_STYLE);
        txtDustRegen.position.set(HALF_BTN_WIDTH, BTN_Y);
        this.addChild(txtDustRegen);
        var btnAddDustRegen = new Button("assets/_distribute/gui_plus.png", Global.BTN_WIDTH + 120, BTN_Y, 32, 32);
        btnAddDustRegen.onClick = () => this.regenDustPts(this.regenDustPts() + 1);
        this.addChild(btnAddDustRegen);

        var btnRemoveDustRegen = new Button("assets/_distribute/gui_minus.png", Global.BTN_WIDTH + 168, BTN_Y, 32, 32);
        btnRemoveDustRegen.onClick = () => this.regenDustPts(this.regenDustPts() - 1);
        this.addChild(btnRemoveDustRegen);

        var handlPointsChange = ko.computed(() => {
            let free = this.freePoints() > 0;
            btnAddMaxHp.interactive = free;
            btnAddMaxHp.tint = free ? 0xffffff : 0xaaaaaa;

            btnAddMaxDust.interactive = free;
            btnAddMaxDust.tint = free ? 0xffffff : 0xaaaaaa;

            btnAddHpRegen.interactive = free;
            btnAddHpRegen.tint = free ? 0xffffff : 0xaaaaaa;

            btnAddDustRegen.interactive = free;
            btnAddDustRegen.tint = free ? 0xffffff : 0xaaaaaa;

            btnRemoveMaxHp.interactive = this.maxHpPts() > 0;
            btnRemoveMaxHp.tint = this.maxHpPts() > 0 ? 0xffffff : 0xaaaaaa;

            btnRemoveMaxDust.interactive = this.maxDustPts() > 0;
            btnRemoveMaxDust.tint = this.maxDustPts() > 0 ? 0xffffff : 0xaaaaaa;

            btnRemoveDustRegen.interactive = this.regenDustPts() > 0;
            btnRemoveDustRegen.tint = this.regenDustPts() > 0 ? 0xffffff : 0xaaaaaa;

            btnRemoveHpRegen.interactive = this.regenHpPts() > 0;
            btnRemoveHpRegen.tint = this.regenHpPts() > 0 ? 0xffffff : 0xaaaaaa;

            txtMaxHp.text = `Max HP: ${this.maxHpPts()}`;
            txtMaxDust.text = `Max Dust: ${this.maxDustPts()}`;
            txtDustRegen.text = `Dust regeneration: ${this.regenDustPts()}`;
            txtHpRegen.text = `HP regeneration: ${this.regenHpPts()}`;
        });



        BTN_Y = Global.SCENE_HEIGHT - Global.BTN_HEIGHT - (Global.BTN_HEIGHT / 2);
        //------------------------
        //  Cancel (back to game)
        //------------------------
        var btnBack = new Button("assets/_distribute/Button1.png", HALF_BTN_WIDTH, BTN_Y, Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnBack.Text = new PIXI.Text("Cancel", Global.BTN_STYLE);
        btnBack.onClick = () => Global.sceneMngr.ActivateScene("InGame");
        this.addChild(btnBack);

        //------------------------
        //  Save & back to game
        //------------------------
        var btnSave = new Button("assets/_distribute/Button1.png", HALF_BTN_WIDTH * 3.5, BTN_Y, Global.BTN_WIDTH, Global.BTN_HEIGHT);
        this.addChild(btnSave);
        btnSave.Text = new PIXI.Text("Save", Global.BTN_STYLE);
        btnSave.onClick = () => {
            //  TODO: save attribute distribution
            Global.sceneMngr.ActivateScene("InGame");
        };      
        
    };

     
}

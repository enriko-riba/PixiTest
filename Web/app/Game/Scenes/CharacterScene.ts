import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import { StatType } from "../Player/PlayerStats";
import * as Global from "../Global";
import * as ko from "knockout";

/**
 *   Main character management scene.
 */
export class CharacterScene extends Scene {

    private TEXT_STYLE: PIXI.ITextStyleStyle =
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
        var btnAddMaxHp = new Button("assets/_distribute/gui_plus.png", HALF_BTN_WIDTH + 120, BTN_Y, 32, 32);
        btnAddMaxHp.onClick = () => this.maxHpPts(this.maxHpPts()+1);
        this.addChild(btnAddMaxHp);

        var btnRemoveMaxHp = new Button("assets/_distribute/gui_minus.png", HALF_BTN_WIDTH + 168, BTN_Y, 32, 32);
        btnRemoveMaxHp.onClick = () => this.maxHpPts(this.maxHpPts() - 1);
        this.addChild(btnRemoveMaxHp);

        var handlMaxHpChange = ko.computed(() => {
            btnAddMaxHp.interactive = this.freePoints() > 0;
            btnAddMaxHp.tint = this.freePoints() > 0 ? 0xffffff : 0xaaaaaa;

            btnRemoveMaxHp.interactive = this.maxHpPts() > 0;
            btnRemoveMaxHp.tint = this.maxHpPts() > 0 ? 0xffffff : 0xaaaaaa;

            txtMaxHp.text = `Max HP: ${this.maxHpPts()}`;
        });

        //  Dust +/-
        BTN_Y = Global.BTN_HEIGHT * 3;
        var txtMaxDust = new PIXI.Text("Max Dust", this.TEXT_STYLE);
        txtMaxDust.position.set(HALF_BTN_WIDTH, BTN_Y);
        this.addChild(txtMaxDust);
        var btnAddMaxDust = new Button("assets/_distribute/gui_plus.png", HALF_BTN_WIDTH + 120, BTN_Y, 32, 32);
        btnAddMaxDust.onClick = () => this.maxDustPts(this.maxDustPts() + 1);
        this.addChild(btnAddMaxDust);

        var btnRemoveMaxDust = new Button("assets/_distribute/gui_minus.png", HALF_BTN_WIDTH + 168, BTN_Y, 32, 32);
        btnRemoveMaxDust.onClick = () => this.maxDustPts(this.maxDustPts() - 1);
        this.addChild(btnRemoveMaxDust);

        var handlMaxDustChange = ko.computed(() => {
            btnAddMaxDust.interactive = this.freePoints() > 0;
            btnAddMaxDust.tint = this.freePoints() > 0 ? 0xffffff : 0xaaaaaa;

            btnRemoveMaxDust.interactive = this.maxDustPts() > 0;
            btnRemoveMaxDust.tint = this.maxDustPts() > 0 ? 0xffffff : 0xaaaaaa;

            txtMaxDust.text = `Max Dust: ${this.maxDustPts()}`;
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

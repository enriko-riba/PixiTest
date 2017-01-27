import * as Global from "./Global";
import * as AjaxHelper from "app/Common/AjaxHelper";
import { WorldP2 } from "./WorldP2";
import { HeroCharacter } from "./HeroCharacter";
import { ITriggerDefinition } from "./LevelLoader";
import { InGameScene } from "./InGameScene";
import { CutScene } from "./CutScene";
import { StatType } from "./PlayerStats";

declare var baseUrl: string;

/**
 * Contains quest related logic, checks and helpers.
 */
export class QuestManager {
    private questState: Array<QuestState> = [];
    private previousQuestMessage: PIXI.Sprite;

    constructor(private gameScene: InGameScene, private wp2: WorldP2, private hero: HeroCharacter) {
    }

    /**
     * Sets the quest state.
     */
    public setQuestState(questId: number, state: QuestState) {
        this.questState[questId] = state;
    }

    /**
     * Gets the quest state.
     */
    public getQuestState(questId: number): QuestState {
        return this.questState[questId] || QuestState.None;
    }

    /**
     * checks if the body has any trigger conditions.
     * If the conditions are met the trigger is executed.
     */
    public checkTriggerCondition = (body: any) => {
        if (!body.Trigger) {
            return;
        }

        var t = body.Trigger.type;
        switch (t) {
            case "collision":
                break;

            case "distance":
                let x = this.hero.position.x - body.position[0];
                let y = this.hero.position.y - body.position[1];
                let distance = Math.sqrt(x * x + y * y);
                if (body.Trigger.distance >= distance) {
                    this.handleTriggerEvent(body);
                }
                break;
        }
    };

    /**
     * Handles level events triggers.
     * @param body
     */
    public handleTriggerEvent(body: any): void {
        var dispObj: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;

        var trigger: ITriggerDefinition = body.Trigger;
        var pos = new PIXI.Point(dispObj.position.x, dispObj.position.y);
        if (trigger.textposition !== undefined) {
            pos.x += trigger.textposition[0];
            pos.y += trigger.textposition[1];
        }

        let state = this.getQuestState(trigger.questId);

        if (trigger.questId) {
            switch (trigger.questId) {
                case 1: //   intro
                    if (state === QuestState.Completed || state === QuestState.Finished) {
                        ;
                    }
                    else {
                        this.setQuestState(trigger.questId, QuestState.Completed);

                        this.gameScene.IsHeroInteractive = false;
                        this.previousQuestMessage = this.gameScene.addTriggerMessage(pos, trigger.text, Global.QUEST_STYLE, 0);
                        setTimeout(() => {
                            this.gameScene.worldContainer.removeChild(this.previousQuestMessage);
                            this.previousQuestMessage = this.gameScene.addTriggerMessage(pos, trigger.completedText, Global.QUEST_STYLE, 0);
                            setTimeout(() => {
                                this.gameScene.worldContainer.removeChild(this.previousQuestMessage);
                                this.previousQuestMessage = this.gameScene.addTriggerMessage(pos, "Now jump\non that big box.", Global.QUEST_STYLE, 0);
                                this.setQuestState(trigger.questId, QuestState.Finished);
                                this.gameScene.IsHeroInteractive = true;
                            }, 4000);
                        }, 4000);
                    }
                    break;

                case 2: //  intro - jump on box task
                    if (this.getQuestState(1) === QuestState.Finished) {
                        if (state === QuestState.Finished || state === QuestState.Completed) {
                            ;
                        } else {
                            this.setQuestState(trigger.questId, QuestState.Completed);
                            this.gameScene.IsHeroInteractive = false;

                            this.gameScene.worldContainer.removeChild(this.previousQuestMessage);
                            this.previousQuestMessage = this.gameScene.addTriggerMessage(pos, trigger.text, Global.QUEST_STYLE, 0);

                            setTimeout(() => {
                                this.gameScene.worldContainer.removeChild(this.previousQuestMessage);
                                this.previousQuestMessage = this.gameScene.addTriggerMessage(pos, trigger.completedText, Global.QUEST_STYLE, 0);
                                this.setQuestState(trigger.questId, QuestState.Finished);
                                this.hero.IsInteractive = true;
                            }, 4000);
                        }
                    }
                    break;

                case 3: //  intro - exit sign
                    if (this.getQuestState(2) === QuestState.Finished) {
                        if (state === QuestState.Finished) {
                            ;
                        } else {
                            this.saveUserState();
                            this.setQuestState(trigger.questId, QuestState.Finished);
                            this.gameScene.IsHeroInteractive = false;

                            this.gameScene.worldContainer.removeChild(this.previousQuestMessage);
                            this.previousQuestMessage = this.gameScene.addTriggerMessage(pos, trigger.text, Global.QUEST_STYLE, 0);

                            this.gameScene.snd.win();

                            var balloon = this.gameScene.worldContainer.getChildByName("balloon");
                            var anim1 = new TWEEN.Tween(balloon)
                                .to({ x: dispObj.position.x }, 3000).start();

                            var endx = (dispObj.position.x - 300);// + trigger.textposition[0];
                            var anim2 = new TWEEN.Tween(this.previousQuestMessage)
                                .to({ x: endx }, 3000)
                                .onComplete(() => {
                                    this.gameScene.hud.visible = false;
                                    this.gameScene.worldContainer.removeChild(this.previousQuestMessage);
                                    var cs = Global.sceneMngr.GetScene("CutScene") as CutScene;
                                    cs.SetText("Listen up lad,\nYou did well...for a n00b.\n\nThe time is running out.\nNow hurry to the white castle.\nThe real adventure merely begins!", Global.QUEST_STYLE);
                                    var rt = Global.sceneMngr.CaptureScene();
                                    cs.SetBackGround(rt, this.gameScene.scale);
                                    Global.sceneMngr.ActivateScene(cs);
                                }).start();
                        }
                    }
                    break;

                case 201:
                    switch (state) {
                        case QuestState.None:
                            this.setQuestState(trigger.questId, QuestState.InProgress);
                            this.previousQuestMessage = this.gameScene.addTriggerMessage(pos, trigger.text, Global.QUEST_STYLE);
                            let item = this.gameScene.worldContainer.getChildByName("quest_item_201");
                            item.visible = true;
                            var lock: any = this.findBodyByName("lock");
                            this.gameScene.worldContainer.removeChild(lock.DisplayObject);
                            this.gameScene.removeEntity(lock);
                            break;

                        case QuestState.InProgress:
                            if (!this.previousQuestMessage || !this.previousQuestMessage.parent) {
                                this.previousQuestMessage = this.gameScene.addTriggerMessage(pos, trigger.text, Global.QUEST_STYLE);
                            }
                            break;

                        case QuestState.Completed:
                            this.saveUserState();
                            this.setQuestState(trigger.questId, QuestState.Finished);
                            this.gameScene.IsHeroInteractive = false;
                            this.gameScene.snd.win();
                            this.gameScene.hud.visible = false;
                            var cs = Global.sceneMngr.GetScene("CutScene") as CutScene;
                            cs.SetText(trigger.completedText, Global.QUEST_STYLE);
                            var rt = Global.sceneMngr.CaptureScene();
                            cs.SetBackGround(rt, this.gameScene.scale);
                            Global.sceneMngr.ActivateScene(cs);
                            break;
                    }
                    break;
            }
        }
    }

    /**
     * Finds a body with the given display objects name.
     * @param name
     */
    private findBodyByName(name: string): p2.Body {
        var foundBody = undefined;
        this.wp2.bodies.forEach((body: any) => {
            var dispObj = body.DisplayObject as PIXI.DisplayObject;
            if (dispObj && dispObj.name === name) {
                foundBody = body;
            }
        });
        return foundBody;
    }

    private saveUserState() {
        let model = {
            ExternalId: Global.UserInfo.id,
            Gold: this.gameScene.PlayerStats.getStat(StatType.Coins),
            Dust: this.gameScene.PlayerStats.getStat(StatType.Dust),
            LastLevel: Global.UserInfo.gamelevel
        };
        AjaxHelper.Post(baseUrl + "/api/user/save", model, (data, status) => {
            console.log("connectUser() response", data);            
        });
    }
}


export enum QuestState {
    None,

    /**
     *  Quest has been started.
     */
    InProgress,

    /**
     *  Quest items/conditions have been completed.
     */
    Completed,

    /**
     *  Quest has been finished.
     */
    Finished
}
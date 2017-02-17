import * as Global from "../Global";
import * as AjaxHelper from "app/Common/AjaxHelper";
import { QuestState } from "./QuestState";
import { Quest } from "./Quest";
import { WorldP2 } from "../Objects/WorldP2";
import { ITriggerDefinition } from "../LevelLoader";
import { InGameScene } from "../Scenes/InGameScene";
import { CutScene } from "../Scenes/CutScene";
import { HeroCharacter } from "../Player/HeroCharacter";
import { StatType } from "../Player/PlayerStats";

declare var baseUrl: string;

/**
 * Contains quest related logic, checks and helpers.
 */
export class QuestManager {
    private questState: Array<QuestState> = [];
    private previousQuestMessage: PIXI.Sprite;

    constructor(private gameScene: InGameScene) {
    }

    /**
     * Resets state of all quests.
     */
    public reset() {
        this.questState = [];
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
                let x = this.gameScene.hero.position.x - body.position[0];
                let y = this.gameScene.hero.position.y - body.position[1];
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
        let state = Math.max(this.getQuestState(trigger.questId), trigger.state || 0);

        if (trigger.questId) {

            var hud = this.gameScene.hud;
            let quest: Quest = this.findQuest(trigger.questId);

            switch (trigger.questId) {
                case 1: //   intro
                    if (state === QuestState.None) {

                        this.setQuestState(trigger.questId, QuestState.Completed);
                        this.gameScene.IsHeroInteractive = false;

                        hud.setQuestMessage(quest.welcomeMsg, 4000, () => {
                            hud.setQuestMessage(quest.completedMsg, 4000, () => {
                                this.gameScene.IsHeroInteractive = true;
                                this.setQuestState(trigger.questId, QuestState.Finished);
                                this.setQuestState(trigger.questId + 1, QuestState.InProgress);
                                quest = this.findQuest(trigger.questId + 1);
                                hud.setQuestMessage(quest.welcomeMsg, 4000);
                            });
                        });
                    }
                    break;

                case 2: //  intro - jump on box task
                    if (this.getQuestState(1) === QuestState.Finished) {
                        if (state === QuestState.InProgress) {
                            this.setQuestState(trigger.questId, QuestState.Completed);
                            this.gameScene.IsHeroInteractive = false;
                            hud.setQuestMessage(quest.completedMsg, 4000, () => {
                                this.gameScene.IsHeroInteractive = true;
                                this.setQuestState(trigger.questId, QuestState.Finished);
                                //  start quest 3
                                quest = this.findQuest(trigger.questId + 1);
                                this.setQuestState(trigger.questId + 1, QuestState.InProgress);
                                //hud.setQuestMessage(quest.welcomeMsg, 4000);
                            });
                        } else if (state == QuestState.Finished) {
                            quest = this.findQuest(trigger.questId + 1);
                            hud.setQuestMessage(quest.welcomeMsg, 4000);
                        }
                    }
                    break;

                case 3: //  intro - exit sign                                           
                    if (state === QuestState.InProgress) {
                        this.saveUserState();
                        this.setQuestState(trigger.questId, QuestState.Finished);
                        this.gameScene.IsHeroInteractive = false;
                        hud.setQuestMessage(quest.completedMsg);

                        Global.snd.win();
                        var balloon = this.gameScene.worldContainer.getChildByName("balloon");
                        (balloon as any).setFollowTarget(null); // prevent following the hero
                        var anim1 = new TWEEN.Tween(balloon)
                            .to({ x: dispObj.position.x }, 3000)
                            .onComplete(() => {
                                this.gameScene.hud.visible = false;
                                var cs = Global.sceneMngr.GetScene("CutScene") as CutScene;
                                cs.SetText(quest.finishedMsg, Global.QUEST_STYLE);
                                var rt = Global.sceneMngr.CaptureScene();
                                cs.SetBackGround(rt, this.gameScene.scale);
                                Global.sceneMngr.ActivateScene(cs);
                            })
                            .start();
                    }

                    break;

                case 201:   //  Kendo knowledge
                    this.genericQuestHandler(quest, state, [
                        () => {
                            let item = this.gameScene.worldContainer.getChildByName("quest_item_201");
                            item.visible = true;
                            var lock: any = this.findBodyByName("lock");
                            this.gameScene.worldContainer.removeChild(lock.DisplayObject);
                            this.gameScene.removeEntity(lock);
                        },
                        () => { },
                        () => {
                            this.saveUserState();
                            this.setQuestState(trigger.questId, QuestState.Finished);
                            this.gameScene.IsHeroInteractive = false;
                            Global.snd.win();
                            this.gameScene.hud.visible = false;
                            var cs = Global.sceneMngr.GetScene("CutScene") as CutScene;
                            cs.SetText(quest.finishedMsg, Global.QUEST_STYLE);
                            var rt = Global.sceneMngr.CaptureScene();
                            cs.SetBackGround(rt, this.gameScene.scale);
                            Global.sceneMngr.ActivateScene(cs);
                        }
                    ]);
                    break;

                case 202:   //  seek the hanshi Kendo master
                    this.genericQuestHandler(quest, state);
                    break;

                case 203:   //  hanshi Kendo master dojo: obtain Oji waza + collect 10 ki
                    this.genericQuestHandler(quest, state, [
                        () => {this.gameScene.hero.PlayerStats.HasJumpAtack = true;},
                        () => { },
                        () => { },
                        () => { }
                    ]);
                    break;
            }
        }
    }

    private genericQuestHandler(quest: Quest, state: QuestState, actions?: Array<() => void>) {
        var hud = this.gameScene.hud;
        var hero = this.gameScene.hero;

        switch (state) {
            case QuestState.None:
                this.setQuestState(quest.id, QuestState.InProgress);
                hud.setQuestMessage(quest.welcomeMsg);
                break;
            case QuestState.InProgress:
                hud.setQuestMessage(quest.welcomeMsg);
                break;
            case QuestState.Completed:
                hud.setQuestMessage(quest.completedMsg);
                break;
            case QuestState.Finished:
                hud.setQuestMessage(quest.finishedMsg);
                if (quest.rewardExp) {
                    hero.PlayerStats.increaseStat(StatType.Exp, quest.rewardExp);
                    let pt = new PIXI.Point(hero.x, hero.y);
                    pt.y += 50;
                    this.gameScene.addInfoMessage(pt, `+${quest.rewardExp} exp`, Global.INFO2_STYLE);
                }
                if (quest.rewardCoins) {
                    hero.PlayerStats.increaseStat(StatType.Exp, quest.rewardExp);
                    let pt = new PIXI.Point(hero.x, hero.y);
                    pt.y += 100;
                    pt.x += 50;
                    this.gameScene.addInfoMessage(pt, `+${quest.rewardCoins} coins`);
                }
                this.setQuestState(quest.id, QuestState.Rewarded);
                break;
        }
        if (actions && actions[state]) {
            actions[state]();
        }
    }

    private findQuest(questId: number): Quest {
        var quests = Global.GameLevels.root.quests.filter((q) => {
            return q.id === questId;
        });
        var quest: Quest = quests[0];
        return quest;
    }

    /**
     * Finds a body with the given display objects name.
     * @param name
     */
    private findBodyByName(name: string): p2.Body {
        var foundBody = undefined;
        this.gameScene.wp2.bodies.forEach((body: any) => {
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
            Gold: this.gameScene.hero.PlayerStats.getStat(StatType.Coins),
            Dust: Math.floor(this.gameScene.hero.PlayerStats.getStat(StatType.Dust)),
            Exp: this.gameScene.hero.PlayerStats.getStat(StatType.Exp),
            LastLevel: Global.UserInfo.gamelevel,
            // TODO: add sending attributes, skills, exp etc
        };
        AjaxHelper.Post(baseUrl + "/api/user/save", model, (data, status) => {
            console.log("connectUser() response", data);
        });
    }
}


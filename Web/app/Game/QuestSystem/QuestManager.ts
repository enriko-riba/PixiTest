import * as Global from "../Global";
import { QuestState } from "./QuestState";
import { Quest } from "./Quest";
import { WorldP2 } from "../Objects/WorldP2";
import { ITriggerDefinition } from "../LevelLoader";
import { InGameScene } from "../Scenes/InGameScene";
import { CutScene } from "../Scenes/CutScene";
import { HeroCharacter } from "../Player/HeroCharacter";
import { StatType } from "../Player/PlayerStats";
import { Hud } from "../Hud";


/**
 * Contains quest related logic, checks and helpers.
 */
export class QuestManager {
    private questState: Array<QuestState> = [];
    private previousQuestMessage: PIXI.Sprite;
    private hud: Hud;

    constructor(private gameScene: InGameScene) {
        this.hud = this.gameScene.HudOverlay as Hud;
    }

    /**
     * Resets state of all quests.
     */
    public reset() {
        this.questState = [];
    }

    /**
     * 
     * @param itemId
     */
    public acquireItem(itemId: number) {
        //  find if there is an unfinished quest depending on that item
        let quest = this.findQuestWithItem(itemId);
        if (quest) {
            quest.itemsCollected++;
            this.hud.addQuestItemMessage(`collected ${quest.itemsCollected} / ${quest.itemsNeeded}`);
            if (quest.itemsCollected >= quest.itemsNeeded) {
                this.setQuestState(quest.id, QuestState.Completed);
                if (quest.completedMsg) {
                    this.hud.setQuestMessage(quest.completedMsg);
                }
            }
        }
    }

    /**
     * Checks if a trigger can be activated. 
     * @param trigger
     */
    public canActivateTrigger(trigger: ITriggerDefinition): boolean {
        if (!trigger || !trigger.questId) {
            return false;
        }

        //  check if trigger depends on quest 
        if (Array.isArray(trigger.dependsOn)) {
            for (var i = 0; i < trigger.dependsOn.length; i++) {
                let dependency = trigger.dependsOn[i];
                let state = this.questState[dependency];
                if (!state || state != QuestState.Rewarded)
                    return false;
            }
        }

        let TEN_SECONDS = 10000;
        let nextAllowedTime = (trigger.lastActive || -TEN_SECONDS) + TEN_SECONDS;
        return nextAllowedTime < performance.now();
    }

    /**
     * Handles level events triggers.
     * @param body
     */
    public handleTriggerEvent(body: any): void {
        let TEN_SECONDS = 10000;
        
        var trigger: ITriggerDefinition = body.Trigger;

        //  note: trigger can have a predefined state (so we skip previous states)
        let state = Math.max(this.getQuestState(trigger.questId), trigger.state || 0);

        // react only if trigger has quest id and last active is older than 10 seconds 
        if (this.canActivateTrigger(trigger)) {
            trigger.lastActive = performance.now();

            let quest: Quest = this.findQuest(trigger.questId);

            switch (trigger.questId) {
                case 1: //   intro
                    if (state === QuestState.None) {

                        this.setQuestState(trigger.questId, QuestState.Completed);
                        this.gameScene.IsHeroInteractive = false;

                        this.hud.setQuestMessage(quest.welcomeMsg, 4000, () => {
                            this.hud.setQuestMessage(quest.completedMsg, 4000, () => {
                                this.gameScene.IsHeroInteractive = true;
                                this.setQuestState(trigger.questId, QuestState.Finished);
                                this.giveRewards(quest);

                                this.setQuestState(trigger.questId + 1, QuestState.InProgress);
                                quest = this.findQuest(trigger.questId + 1);
                                this.hud.setQuestMessage(quest.welcomeMsg, 4000);
                            });
                        });
                    }
                    break;

                case 2: //  intro - jump on box task
                    if (this.getQuestState(1) > QuestState.Finished) {
                        if (state === QuestState.InProgress) {
                            this.setQuestState(trigger.questId, QuestState.Completed);
                            this.gameScene.IsHeroInteractive = false;
                            this.hud.setQuestMessage(quest.completedMsg, 4000, () => {
                                this.gameScene.IsHeroInteractive = true;
                                this.setQuestState(trigger.questId, QuestState.Finished);
                                this.giveRewards(quest);

                                //  start quest 3
                                quest = this.findQuest(trigger.questId + 1);
                                this.setQuestState(trigger.questId + 1, QuestState.InProgress);
                                this.hud.setQuestMessage(quest.welcomeMsg);
                            });
                        } else if (state >= QuestState.Finished) {
                            quest = this.findQuest(trigger.questId + 1);
                            this.hud.setQuestMessage(quest.welcomeMsg, 4000);
                        }
                    }
                    break;

                case 3: //  intro - exit sign                                           
                    if (state === QuestState.InProgress) {
                        this.setQuestState(trigger.questId, QuestState.Finished);
                        this.giveRewards(quest);
                        this.gameScene.IsHeroInteractive = false;
                        this.hud.setQuestMessage(quest.completedMsg);

                        Global.stats.saveUserState(true);

                        Global.snd.win();
                        var balloon = this.gameScene.worldContainer.getChildByName("balloon");
                        (balloon as any).setFollowTarget(null); // prevent following the hero
                        var anim1 = new TWEEN.Tween(balloon)
                            .to({ x: body.DisplayObject.position.x }, 3000)
                            .onComplete(() => {
                                this.hud.visible = false;
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
                    this.genericQuestHandler(quest, state, body, [
                        () => {
                            let item = this.gameScene.worldContainer.getChildByName("quest_item_201");
                            item.visible = true;
                            var lock: any = this.findBodyByName("lock");                            
                            this.gameScene.removeEntity(lock, true);
                        },
                        () => { },
                        () => {
                            this.setQuestState(trigger.questId, QuestState.Finished);
                            this.giveRewards(quest);
                            this.gameScene.IsHeroInteractive = false;

                            Global.stats.saveUserState(true);

                            Global.snd.win();
                            this.hud.visible = false;
                            var cs = Global.sceneMngr.GetScene("CutScene") as CutScene;
                            cs.SetText(quest.finishedMsg, Global.QUEST_STYLE);
                            var rt = Global.sceneMngr.CaptureScene();
                            cs.SetBackGround(rt, this.gameScene.scale);
                            Global.sceneMngr.ActivateScene(cs);
                        }
                    ]);
                    break;

                case 202:   //  seek the hanshi Kendo master
                    this.genericQuestHandler(quest, state, body);
                    break;

                case 203:   //  hanshi Kendo master dojo: collect 10 ki
                    this.genericQuestHandler(quest, state, body, [
                        () => { Global.stats.HasJumpAtack = true;},
                        () => { },
                        () => { },
                        () => { }
                    ]);
                    break;

                case 204:   //  hanshi Kendo master dojo: collect 25 ki
                    this.genericQuestHandler(quest, state, body);
                    break;
            }
        }
    }

    private genericQuestHandler(quest: Quest, state: QuestState, body, actions?: Array<() => void>) {
        let trigger: ITriggerDefinition = body.Trigger;
        switch (state) {
            case QuestState.None:
                this.setQuestState(quest.id, QuestState.InProgress);
                this.hud.setQuestMessage(quest.welcomeMsg);
                break;
            case QuestState.InProgress:
                this.hud.setQuestMessage(quest.objectiveMsg);
                break;
            case QuestState.Completed:
                if (quest.itemId && quest.itemsCollected >= quest.itemsNeeded) { //  if the acquireItem has set quest to completed move to next stated
                    this.setQuestState(quest.id, QuestState.Finished);
                    trigger.lastActive = 0;
                } else { 
                    this.hud.setQuestMessage(quest.completedMsg);
                }
                break;
            case QuestState.Finished:
                this.hud.setQuestMessage(quest.finishedMsg);
                this.giveRewards(quest);
                this.gameScene.removeEntity(body, true); // remove the sensor from physics and the displayobject from scene
                break;
        }
        if (actions && actions[state]) {
            actions[state]();
        }
    }

    private giveRewards(quest: Quest) {
        var hero = this.gameScene.hero;
        Global.snd.questItem();
        if (quest.rewardExp) {
            Global.stats.increaseStat(StatType.TotalExp, quest.rewardExp);
            let pt = new PIXI.Point(hero.x, hero.y + 50);
            this.hud.addInfoMessage(pt, `+${quest.rewardExp} exp`, Global.MSG_EXP_STYLE);
        }
        if (quest.rewardCoins) {
            Global.stats.increaseStat(StatType.Coins, quest.rewardCoins);
            let pt = new PIXI.Point(hero.x + 50, hero.y + 100);
            this.hud.addInfoMessage(pt, `+${quest.rewardCoins} coins`);
        }
        this.setQuestState(quest.id, QuestState.Rewarded);
    }

    private findQuest(questId: number): Quest {
        var quests = Global.GameLevels.root.quests.filter((q) => {
            return q.id === questId;
        });
        var quest: Quest = quests[0];
        return quest;
    }

    private findQuestWithItem(itemId: number): Quest {
        var quests = Global.GameLevels.root.quests.filter((q: Quest) => {
            if (q.itemId === itemId) {
                let state = this.getQuestState(q.id);
                return state < QuestState.Completed && state > QuestState.None;
            }            
            return false;
        });
        if (quests.length > 0) {
            return quests[0];
        } else {
            return null;
        }
    }

    /**
    * Sets the quest state.
    */
    private setQuestState(questId: number, state: QuestState) {
        this.questState[questId] = state;
    }

    /**
     * Gets the quest state.
     */
    private getQuestState(questId: number): QuestState {
        return this.questState[questId] || QuestState.None;
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
}


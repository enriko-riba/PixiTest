import { WorldP2 } from "./WorldP2";
import { HeroCharacter } from "./HeroCharacter";


/**
 * Contains quest related logic, checks and helpers.
 */
export class QuestManager {
    private questState: Array<QuestState> = [];

    constructor(private wp2: WorldP2, private hero: HeroCharacter) {
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
        return this.questState[questId];
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
                break;
        }
    };
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
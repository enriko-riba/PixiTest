import { State } from "./SceneManager";

/**
*   Simple keyboard mapper.
*/
export class KeyboardMapper {

    /**
    *   Stores keyboard pressed state.
    */
    private keyboard: boolean[];

    /**
    *   Stores an array of KeyboardAction instances per Global.State. The 'state' indexer is a numeric value from the Global.State enum.
    */
    private stateActions: { [state: number]: KeyboardAction[]; };

    private ALT_KEY: number = 18;
    private SHIFT_KEY: number = 16;
    private CTRL_KEY: number = 17;


    /**
    *   Creates a new KeyboardMapper instance.
    */
    constructor() {

        this.keyboard = [];
        for (var i: number = 0; i < 256; i++) { this.keyboard[i] = false; }

        this.initStateActions();

        document.addEventListener('keydown', this.keydown.bind(this), false);
        document.addEventListener('keyup', this.keyup.bind(this), false);
    }

    /*
    *   Invokes needed action handlers based on the pressed keys.
    */
    public update(currentState: State) {

        //  state specific handler
        var actions: KeyboardAction[] = this.stateActions[currentState];
        this.findHandlerAndInvoke(actions);


        //  global handlers
        actions = this.stateActions[State.GENERAL];
        this.findHandlerAndInvoke(actions);
    }

    /**
    *   Searches for all keyboard handlers with matching current pressed key combinations and invokes them.
    */
    private findHandlerAndInvoke(actions: KeyboardAction[]) {
        if (actions) {
            var len = actions.length;
            for (var i: number = 0; i < len; i++) {
                var ka = actions[i];
                if (ka && ka.isAssigned()
                    && this.keyboard[ka.key]
                    && this.keyboard[this.ALT_KEY] == ka.altKey
                    && this.keyboard[this.SHIFT_KEY] == ka.shiftKey
                    && this.keyboard[this.CTRL_KEY] == ka.ctrlKey) {
                    ka.handler();
                    if (ka.releaseKeyAfterInvoke) this.keyboard[ka.key] = false;
                }
            }
        }
    }

    private initStateActions() {
        this.stateActions = {};

        //this.stateActions[Global.State.SECTOR_TACTICAL] = [];            
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*W*/new KeyboardAction(87, 'Increase thrust', () => this.shipEngine.thrustIncrease(), false ));
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*S*/new KeyboardAction(83, 'Decrease thrust', () => this.shipEngine.thrustDecrease(), false ));
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*Q*/new KeyboardAction(81, 'Roll left', () => this.shipEngine.rollLeft(), false ));
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*E*/new KeyboardAction(69, 'Roll right', () => this.shipEngine.rollRight(), false ));
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*C*/new KeyboardAction(67, 'Next celestial', () => this.vm.playerControls.targetCelestialShift(1) ));
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*C + shift*/new KeyboardAction(67, 'Previous celestial', () => this.vm.playerControls.targetCelestialShift(-1), true, true));           
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*X*/new KeyboardAction(88, 'Autotarget celestial', () => this.shipEngine.autotargetCelestial() ));
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*1*/new KeyboardAction(49, '1/3 speed', () => this.shipEngine.speedControl(0.33333333) ));
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*2*/new KeyboardAction(50, '1/2 speed', () => this.shipEngine.speedControl(0.5) ));
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*3*/new KeyboardAction(51, 'Full speed', () => this.shipEngine.speedControl(1.0)));

        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*T*/new KeyboardAction(84, 'Next target', () => this.vm.playerControls.targetTacticalShift(1)));
        //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*C + shift*/new KeyboardAction(84, 'Previous target', () => this.vm.playerControls.targetTacticalShift(-1), true, true));

        //this.stateActions[Global.State.SECTOR_SHIP] = [];
        //this.stateActions[Global.State.SECTOR_NAV_MAP] = [];


        //this.stateActions[Global.State.DOCKED_MISSIONS] = [];
        //this.stateActions[Global.State.DOCKED_MODULES] = [];
        //this.stateActions[Global.State.DOCKED_REPAIR] = [];
        //this.stateActions[Global.State.DOCKED_TRADE] = [];

    }

    private keydown(e/*: JQueryEventObject*/) {
        this.keyboard[e.which] = true;
    }

    private keyup(e/*: JQueryEventObject*/) {
        this.keyboard[e.which] = false;
    }
}



export class KeyboardAction {

    /**
    *   Returns true if the handler is assigned.
    */
    public isAssigned(): boolean {
        return this.handler !== undefined;
    }

    /**
    *   Creates a new KeyboardAction instance.
    */
    constructor(
        public key: number,
        public name: string,
        public handler: KeyboardActionCallback = undefined,
        public releaseKeyAfterInvoke: boolean = true,
        public shiftKey: boolean = false,
        public ctrlKey: boolean = false,
        public altKey: boolean = false) {
    }
}

export interface KeyboardActionCallback {
    (): void;
}

import * as p2 from "p2";
import { Dictionary } from "app/_engine/Dictionary";

export class PWorld {
    public player: p2.Body;

    private world: p2.World;
    private ground: p2.Body;

    private readonly fixedTimeStep = 1 / 80; // seconds

    private playerPosition: PIXI.Point;
    private materials: Dictionary<p2.Material>;

    constructor(playerPosition: PIXI.Point) {
        this.world = new p2.World({
            gravity: [0, -9.0]
        });
        
        this.setupMaterials();

        this.playerPosition = playerPosition;

        // Create an infinite ground plane body
        this.ground = new p2.Body({
            mass: 0,
        });
        var shape = new p2.Plane();
        shape.material = this.materials.get('ground_default');
        this.ground.addShape(shape);
        this.world.addBody(this.ground);

        //  player body
        this.player = new p2.Body({
            mass: 40,
            position: [playerPosition.x, playerPosition.y]            
        });
        shape = new p2.Capsule({
            length: 20,
            radius: 6,
        });
        shape.material = this.materials.get('player');
        this.player.addShape(shape);
        this.world.addBody(this.player);


        this.world.on("beginContact", this.contact, this);
    }

    public update(dt: number) {
        this.world.step(this.fixedTimeStep, dt, 30);
        this.playerPosition.x = this.player.interpolatedPosition[0];
        this.playerPosition.y = this.player.interpolatedPosition[1];
    }

    /**
    * adds an object to the p2 world
    * @param bodyOptions
    * @param shape
    */
    public addObject(bodyOptions?: p2.BodyOptions, shape?: p2.Shape): p2.Body {
        var body = new p2.Body(bodyOptions);
        if (!shape) {
            shape = new p2.Box({ width: 64, height: 64 });
        }
        if (!shape.material) {
            shape.material = this.materials.get('box_default');
        }
        body.addShape(shape);
        this.world.addBody(body);
        return body;
    }

    /**
    * adds an object to the p2 world
    * @param body
    */
    public addBody(body: p2.Body) {
        this.world.addBody(body);
    }

    private contact = (evt: any) => {
        if (evt.bodyA === this.player || evt.bodyB === this.player) {
            console.log('player body contact');
        }  

        if (evt.bodyA === this.ground || evt.bodyB === this.ground) {
            console.log('ground contact');
        }        
    }  


    private setupMaterials() {
        this.materials = new Dictionary<p2.Material>();
        this.materials.set('player', new p2.Material(p2.Material.idCounter++));
        this.materials.set('ground_default', new p2.Material(p2.Material.idCounter++));
        this.materials.set('box_default', new p2.Material(p2.Material.idCounter++));


        var groundContactMaterial = new p2.ContactMaterial(
            this.materials.get('player'),
            this.materials.get('ground_default'),
            {
                friction: 0.4,
                restitution: 0.2,
                stiffness: p2.Equation.DEFAULT_STIFFNESS * 0.5,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity:0
            });
        this.world.addContactMaterial(groundContactMaterial);

        var boxContactMaterial = new p2.ContactMaterial(
            this.materials.get('player'),
            this.materials.get('box_default'),
            {
                friction: 0.2,
                restitution: 0.4,
                stiffness: p2.Equation.DEFAULT_STIFFNESS * 0.5,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(boxContactMaterial);
    }
}
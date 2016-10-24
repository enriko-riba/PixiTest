import * as p2 from "p2";

export class PWorld {
    public player: p2.Body;

    private world: p2.World;
    private ground: p2.Body;

    private readonly fixedTimeStep = 1 / 60; // seconds

    private playerPosition: PIXI.Point;

    constructor(playerPosition: PIXI.Point) {
        this.playerPosition = playerPosition;
        this.world = new p2.World({
            gravity: [0, -9.82]
        });

        // Create an infinite ground plane body
        this.ground = new p2.Body({
            mass: 0 // Setting mass to 0 makes it static
        });
        var groundShape = new p2.Plane();
        this.ground.addShape(groundShape);
        this.world.addBody(this.ground);


        // Create an empty dynamic body
        this.player = new p2.Body({
            mass: 40,
            position: [playerPosition.x, playerPosition.y]
        });
        var shape = new p2.Capsule({ length: 50, radius: 10 });
        this.player.addShape(shape);
        this.world.addBody(this.player);

        this.world.on("beginContact", this.contact, this);
    }

    public update(dt: number) {
        this.world.step(this.fixedTimeStep, dt, 10);
        this.playerPosition.x = this.player.interpolatedPosition[0];
        this.playerPosition.y = this.player.interpolatedPosition[1];
    }

    public addObject(bodyOptions?: p2.BodyOptions, shape?: p2.Shape): p2.Body {
        var body = new p2.Body(bodyOptions);
        if (!shape)
            shape = new p2.Box({ width: 10, height: 10 });
        body.addShape(shape);
        this.world.addBody(body);
        return body;
    }

    private contact = (evt: any) => {
        if (evt.bodyA === this.player || evt.bodyB === this.player) {
            console.log('player body contact');
        }        
    }
     
}
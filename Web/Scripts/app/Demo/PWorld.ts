import * as p2 from "p2";

export class PWorld {
    private world: p2.World;
    private ground: p2.Body;
    public player: p2.Body;
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
            mass: 50,
            position: [10, 364]
        });

        // Add a circle shape to the body
        var circleShape = new p2.Circle({ radius: 16 });
        this.player.addShape(circleShape);

        // ...and add the body to the world.
        // If we don't add it to the world, it won't be simulated.
        this.world.addBody(this.player);
    }

    public update(dt: number) {
        this.world.step(this.fixedTimeStep, dt, 10);
        //this.playerPosition.x = this.player.interpolatedPosition[0];
        this.playerPosition.y = this.player.interpolatedPosition[1];
        //console.log("player:" + this.playerPosition.x + ", " + this.playerPosition.y);
    }
}
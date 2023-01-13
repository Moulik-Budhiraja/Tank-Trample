import { Position, Velocity } from './position';
import { Map } from './map';

export class Projectile {
    position: Position;
    velocity: Velocity;
    ownerId: string;
    collision: boolean = true;
    lifeTime: number = 1000;
    timeFired: number = NaN;

    constructor(position: Position, velocity: Velocity, ownerId: string) {
        this.position = position;
        this.velocity = velocity;
        this.ownerId = ownerId;
    }

    // ! NEEDS WORK
    update(map: Map) {
        // this.position.updateByVelocity(this.velocity);
    }
}

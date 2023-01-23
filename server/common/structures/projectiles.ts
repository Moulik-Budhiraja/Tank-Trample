import { Position, Velocity } from './position';
import { Map } from './map';
import { CondensedProjectile } from '../types/projectileTypes';

export class Projectile {
    id: string;
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

        this.id =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    // ! NEEDS WORK
    update(map: Map) {
        // this.position.updateByVelocity(this.velocity);
    }

    getCondensed(): CondensedProjectile {
        return {
            id: this.id,
            playerId: this.ownerId,
            timeCreated: this.timeFired,
            lifeTime: this.lifeTime,
            pos: this.position.getCondensed(),
            vel: {
                x: this.velocity.x,
                y: this.velocity.y
            }
        };
    }
}

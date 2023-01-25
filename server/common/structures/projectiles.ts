import { Position, Velocity } from './position';
import { Map } from './map';
import { CondensedProjectile } from '../types/projectileTypes';

export class Projectile {
    id: string;
    position: Position;
    velocity: Velocity;
    ownerId: string;
    // collision: boolean = true;
    lifeTime: number = 15000;
    timeFired: number = NaN;

    constructor(position: Position, velocity: Velocity, ownerId: string) {
        this.position = position;
        this.velocity = velocity;
        this.ownerId = ownerId;

        this.id =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        this.timeFired = Date.now();
    }

    // ! NEEDS WORK
    update(map: Map) {
        this.position.updateByVelocity(this.velocity);

        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x *= -1;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y *= -1;
        }
        if (this.position.x > map.width * map.scale) {
            this.position.x = map.width * map.scale;
            this.velocity.x *= -1;
        }
        if (this.position.y > map.height * map.scale) {
            this.position.y = map.height * map.scale;
            this.velocity.y *= -1;
        }
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

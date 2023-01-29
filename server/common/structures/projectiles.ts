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

    update(map: Map) {
        let oldNode = map.getNodeFromPos(this.position);
        let oldPos = this.position.copy();
        this.position.updateByVelocity(this.velocity);

        let newNode = map.getNodeFromPos(this.position);
        let newPos = this.position.copy();
        if (oldNode === null || newNode === null) {}
        else if (oldNode === newNode || oldNode.connected.includes(newNode)) {
            return;
        } 
        let slope = (newPos.y - oldPos.y) / (newPos.x - oldPos.x);
        let h1 = Math.floor(oldPos.y / map.scale) * map.scale;
        let h2 = Math.ceil(oldPos.y / map.scale) * map.scale;
        let v1 = Math.floor(oldPos.x / map.scale) * map.scale;
        let v2 = Math.ceil(oldPos.x / map.scale) * map.scale;

        let x1 = (h1 - oldPos.y) / slope + oldPos.x;
        let x2 = (h2 - oldPos.y) / slope + oldPos.x;
        let y1 = (v1 - oldPos.x) * slope + oldPos.y;
        let y2 = (v2 - oldPos.x) * slope + oldPos.y;

        if (v1 < x1 && x1 < v2 && newPos.y < h1 && h1 < oldPos.y) {
            this.position = new Position(x1, h1);
            this.velocity.y = -this.velocity.y;
        }
        if (v1 < x2 && x2 < v2 && oldPos.y < h2 && h2 < newPos.y) {
            this.position = new Position(x2, h2);
            this.velocity.y = -this.velocity.y;
        }
        if (h1 < y1 && y1 < h2 && newPos.x < v1 && v1 < oldPos.x) {
            this.position = new Position(v1, y1);
            this.velocity.x = -this.velocity.x;
        }
        if (h1 < y2 && y2 < h2 && oldPos.x < v2 && v2 < newPos.x) {
            this.position = new Position(v2, y2);
            this.velocity.x = -this.velocity.x;
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

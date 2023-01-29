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
        const correctionFactor = 0.01;

        // Get the old node and position before the update
        let oldNode = map.getNodeFromPos(this.position);
        let oldPos = this.position.copy();

        // Update the position of the projectile based on its velocity
        this.position.updateByVelocity(this.velocity);

        // Get the new node and position after the update
        let newNode = map.getNodeFromPos(this.position);
        let newPos = this.position.copy();

        // If the old or new node is null, or if the old and new node are the same or connected, return
        if (oldNode === null || newNode === null) {
        } else if (oldNode === newNode || oldNode.connected.includes(newNode)) {
            return;
        }

        // Calculate the slope of the line between the old and new position
        let slope = (newPos.y - oldPos.y) / (newPos.x - oldPos.x);

        // Calculate the horizontal and vertical boundaries of the current node
        let h1 = Math.floor(oldPos.y / map.scale) * map.scale;
        let h2 = Math.ceil(oldPos.y / map.scale) * map.scale;
        let v1 = Math.floor(oldPos.x / map.scale) * map.scale;
        let v2 = Math.ceil(oldPos.x / map.scale) * map.scale;

        // Calculate the intersection points of the line between the old and new position with the horizontal and vertical boundaries of the current node
        let x1 = (h1 - oldPos.y) / slope + oldPos.x;
        let x2 = (h2 - oldPos.y) / slope + oldPos.x;
        let y1 = (v1 - oldPos.x) * slope + oldPos.y;
        let y2 = (v2 - oldPos.x) * slope + oldPos.y;

        // Check if the intersection points are within the boundaries of the current node, and if the new position is on the opposite side of the boundary as the old position
        // If so, update the position to the intersection point and reverse the velocity in the appropriate direction

        // Top boundary
        if (v1 < x1 && x1 < v2 && newPos.y < h1 && h1 < oldPos.y) {
            this.position.moveTo(x1, h1 + correctionFactor);
            this.velocity.y = -this.velocity.y;
        }
        // Bottom boundary
        if (v1 < x2 && x2 < v2 && oldPos.y < h2 && h2 < newPos.y) {
            this.position.moveTo(x2, h2 - correctionFactor);
            this.velocity.y = -this.velocity.y;
        }
        // Left boundary
        if (h1 < y1 && y1 < h2 && newPos.x < v1 && v1 < oldPos.x) {
            this.position.moveTo(v1 + correctionFactor, y1);
            this.velocity.x = -this.velocity.x;
        }
        // Right boundary
        if (h1 < y2 && y2 < h2 && oldPos.x < v2 && v2 < newPos.x) {
            this.position.moveTo(v2 - correctionFactor, y2);
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

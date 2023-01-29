import { Position, Velocity } from './position';
import { Map } from './map';
import { CondensedProjectile } from '../types/projectileTypes';
import { Player } from './player';
import { Round } from './round';

export class Projectile {
    id: string;
    position: Position;
    velocity: Velocity = new Velocity(120, 120);
    ownerId: string;
    collision: boolean = true;
    damage: boolean = true;
    lifeTime: number = 15000;
    timeFired: number = NaN;
    width: number = 10;
    height: number = 10;
    speed = 120;

    constructor(position: Position, velocity: Velocity, ownerId: string) {
        this.position = position;
        this.velocity = velocity;
        this.ownerId = ownerId;

        this.velocity = Velocity.fromAngle(velocity.getAngle(), this.speed);

        this.id =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        this.timeFired = Date.now();
    }

    update(round: Round) {
        const correctionFactor = 0.01;

        // Get the old node and position before the update
        let oldNode = round.map.getNodeFromPos(this.position);
        let oldPos = this.position.copy();

        // Update the position of the projectile based on its velocity
        this.position.updateByVelocity(this.velocity);

        if (this.timeFired + this.lifeTime < Date.now()) {
            round.projectiles.splice(round.projectiles.indexOf(this), 1);
        }

        // Get the new node and position after the update
        let newNode = round.map.getNodeFromPos(this.position);
        let newPos = this.position.copy();

        // If the old or new node is null, or if the old and new node are the same or connected, return
        if (oldNode === null || newNode === null) {
        } else if (oldNode === newNode || oldNode.connected.includes(newNode)) {
            return;
        }

        // Calculate the slope of the line between the old and new position
        let slope = (newPos.y - oldPos.y) / (newPos.x - oldPos.x);

        // Calculate the horizontal and vertical boundaries of the current node
        let h1 = Math.floor(oldPos.y / round.map.scale) * round.map.scale;
        let h2 = Math.ceil(oldPos.y / round.map.scale) * round.map.scale;
        let v1 = Math.floor(oldPos.x / round.map.scale) * round.map.scale;
        let v2 = Math.ceil(oldPos.x / round.map.scale) * round.map.scale;

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

        if (this.damage) {
            // Check if the projectile hit a player
            for (let player of round.players) {
                if (!player.alive) continue;
                if (player.collidePoint(this.position)) {
                    player.alive = false;

                    round.projectiles.splice(
                        round.projectiles.indexOf(this),
                        1
                    );
                }
            }
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
            },
            width: this.width,
            height: this.height
        };
    }
}

export class AirBurst extends Projectile {
    burstDelay: number = 500;
    childLifeTime: number = 1200;
    constructor(position: Position, velocity: Velocity, ownerId: string) {
        super(position, velocity, ownerId);
        this.lifeTime = this.burstDelay + this.childLifeTime;
    }

    update(round: Round) {
        super.update(round);

        if (Date.now() - this.timeFired > this.burstDelay && this.damage) {
            this.damage = false;
            this.collision = false;
            this.width = 0;
            this.height = 0;

            // Burst into 3 projectiles
            for (let angle of [-15, 0, 15]) {
                let child = new Projectile(
                    this.position.copy(),
                    Velocity.fromAngle(this.velocity.getAngle() + angle, 120),
                    this.ownerId
                );
                child.width = 5;
                child.height = 5;
                child.lifeTime = this.childLifeTime;
                child.ownerId = this.id;

                round.projectiles.push(child);
            }
        }
    }
}

export class Rocket extends Projectile {
    speed = 80;
    width = 15;
    height = 15;
    correctionFactor = 1.5;
    constructor(position: Position, velocity: Velocity, ownerId: string) {
        super(position, velocity, ownerId);
    }

    update(round: Round) {
        super.update(round);

        // Push velocity angle towards nearest player
        let nearestPlayer: Player = round.players[0];
        let nearestDistance: number = Infinity;
        for (let player of round.players) {
            if (!player.alive) continue;

            let distance = this.position.distanceTo(player.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestPlayer = player;
            }
        }

        let angle = this.position.angleTo(nearestPlayer.position);

        if (this.velocity.getAngle() < angle) {
            this.velocity.setAngle(
                this.velocity.getAngle() + this.correctionFactor
            );
        } else {
            this.velocity.setAngle(
                this.velocity.getAngle() - this.correctionFactor
            );
        }
    }
}

export class LandMine extends Projectile {
    width = 20;
    height = 20;
    speed = 150;
    lifeTime = 15000;
    damage = false;
    armTime = 2000;
    explodeDistance = 140;
    shrapnelCount = 24;
    shrapnelSpeed = 200;
    shrapnelLifeTime = 600;
    triggerTime = 500;
    timeTriggered: number | null = null;
    constructor(position: Position, velocity: Velocity, ownerId: string) {
        super(position, velocity, ownerId);
    }

    update(round: Round) {
        super.update(round);

        if (Date.now() < this.timeFired + this.armTime) {
            // Speed should linearly approach 0 over the course of the arm time
            this.velocity.setSpeed(
                this.speed * (1 - (Date.now() - this.timeFired) / this.armTime)
            );
        } else {
            this.velocity.setSpeed(0);
        }

        if (Date.now() - this.timeFired > this.armTime) {
            this.damage = true;

            for (let player of round.players) {
                if (!player.alive) continue;

                if (
                    this.position.distanceTo(player.position) <
                    this.explodeDistance
                ) {
                    if (!this.timeTriggered) {
                        this.timeTriggered = Date.now();
                    }
                }
            }
        }

        if (
            this.timeTriggered &&
            Date.now() - this.timeTriggered > this.triggerTime
        ) {
            round.projectiles.splice(round.projectiles.indexOf(this), 1);

            for (
                let angle = 0;
                angle < 360;
                angle += 360 / this.shrapnelCount
            ) {
                let child = new Projectile(
                    this.position.copy(),
                    Velocity.fromAngle(angle, 120),
                    this.ownerId
                );
                child.width = 5;
                child.height = 5;
                child.lifeTime = this.shrapnelLifeTime;
                child.ownerId = this.id;
                child.velocity.setSpeed(this.shrapnelSpeed);

                round.projectiles.push(child);
            }
        }
    }
}

export class Lazar extends Projectile {
    width = 5;
    height = 5;
    speed = 1000;
    lifeTime = 1000;
    constructor(position: Position, velocity: Velocity, ownerId: string) {
        super(position, velocity, ownerId);

        this.velocity.setSpeed(this.speed);
    }

    update(round: Round) {
        super.update(round);
    }
}

export const ProjectileTypes = {
    BULLET: Projectile,
    ROCKET: Rocket,
    LAZAR: Lazar,
    AIRBURST: AirBurst,
    LANDMINE: LandMine
};

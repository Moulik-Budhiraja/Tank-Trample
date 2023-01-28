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

    // ! NEEDS WORK
    update(round: Round) {
        this.position.updateByVelocity(this.velocity);

        if (this.timeFired + this.lifeTime < Date.now()) {
            round.projectiles.splice(round.projectiles.indexOf(this), 1);
        }

        if (this.collision) {
            if (this.position.x < 0) {
                this.position.x = 0;
                this.velocity.x *= -1;
            }
            if (this.position.y < 0) {
                this.position.y = 0;
                this.velocity.y *= -1;
            }
            if (this.position.x > round.map.width * round.map.scale) {
                this.position.x = round.map.width * round.map.scale;
                this.velocity.x *= -1;
            }
            if (this.position.y > round.map.height * round.map.scale) {
                this.position.y = round.map.height * round.map.scale;
                this.velocity.y *= -1;
            }
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

import { Position, Velocity } from './position';
import { MapNode, Maze } from './map';
import {
    CondensedPowerUp,
    CondensedProjectile,
    ProjectileType,
    ProjectileTypes
} from '../types/projectileTypes';
import { Player } from './player';
import { Round } from './round';

export class Projectile {
    id: string;
    name: ProjectileType = 'BULLET';
    position: Position;
    velocity: Velocity = new Velocity(135, 135);
    ownerId: string;
    collision: boolean = true;
    damage: boolean = true;
    lifeTime: number = 15000;
    timeFired: number = NaN;
    width: number = 10;
    height: number = 10;
    speed = 135;

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
    name: ProjectileType = 'AIRBURST';
    burstDelay: number = 1500;
    childLifeTime: number = 2500;
    splitAngleRange: number = 30;
    childCount: number = 5;
    childSpeed: number = 135;
    speed: number = 150;
    constructor(position: Position, velocity: Velocity, ownerId: string) {
        super(position, velocity, ownerId);
        this.lifeTime = this.burstDelay + this.childLifeTime;

        this.velocity.setSpeed(this.speed);
    }

    update(round: Round) {
        super.update(round);

        if (Date.now() - this.timeFired > this.burstDelay && this.damage) {
            this.damage = false;
            this.collision = false;
            this.width = 0;
            this.height = 0;

            let angles = [];

            for (let i = 0; i < this.childCount; i++) {
                angles.push(
                    (this.splitAngleRange / (this.childCount - 1)) * i -
                        this.splitAngleRange / 2
                );
            }

            for (let angle of angles) {
                let child = new Projectile(
                    this.position.copy(),
                    Velocity.fromAngle(this.velocity.getAngle() + angle, 135),
                    this.ownerId
                );
                child.width = 5;
                child.height = 5;
                child.lifeTime = this.childLifeTime;
                child.ownerId = this.id;
                child.velocity.setSpeed(this.childSpeed);

                round.projectiles.push(child);
            }
        }
    }
}

export class Rocket extends Projectile {
    name: ProjectileType = 'ROCKET';
    speed = 110;
    width = 15;
    height = 15;
    correctionFactor = 3;
    lockTime = 2500;
    lastLock: number = 0;
    targetPlayer: Player | null = null;
    goToNew = false;
    lastNode: MapNode | null = null;

    constructor(position: Position, velocity: Velocity, ownerId: string) {
        super(position, velocity, ownerId);

        this.velocity.setSpeed(this.speed);

        this.lastLock = Date.now();
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

        if (this.targetPlayer != nearestPlayer) {
            this.lastLock = Date.now();
            this.targetPlayer = nearestPlayer;
        }

        if (Date.now() - this.lastLock < this.lockTime) {
            this.velocity.setSpeed(this.speed * 1.4);
            return;
        } else {
            this.velocity.setSpeed(this.speed);
        }

        // BFS to the nearest players node
        let currentNode = round.map.getNodeFromPos(this.position);
        let targetNode = round.map.getNodeFromPos(this.targetPlayer.position);

        let queue = [currentNode];
        let visited = new Set();
        let parentMap = new Map();

        while (queue.length > 0) {
            let node = queue.shift();
            if (node == targetNode) break;
            if (!node) break;

            for (let neighbor of node.connected) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    parentMap.set(neighbor, node);
                }
            }
        }

        let path = [targetNode];
        let current = targetNode;
        while (current != currentNode) {
            current = parentMap.get(current);
            path.push(current);
        }

        let nextNode = path[path.length - 2];

        if (!nextNode) return;

        // If the distance to the current node's center is less than half the scale, move to the next node
        // Otherwise, move towards the center of the current node
        if (this.lastNode != currentNode) {
            this.goToNew = false;
            this.lastNode = currentNode;
        }

        let targetPos = this.position;

        if (
            (currentNode &&
                this.position.distanceTo(
                    currentNode.position
                        .copy()
                        .moveBy(round.map.scale / 2, round.map.scale / 2)
                ) <
                    round.map.scale / 2) ||
            this.goToNew
        ) {
            targetPos = nextNode.position
                .copy()
                .moveBy(round.map.scale / 2, round.map.scale / 2);
            this.goToNew = true;
        } else if (currentNode) {
            targetPos = currentNode.position
                .copy()
                .moveBy(round.map.scale / 2, round.map.scale / 2);
        }

        if (currentNode == targetNode) {
            targetPos = this.targetPlayer.position;
        }

        let angle = this.position.angleTo(targetPos);
        angle = (angle + 360) % 360;

        this.velocity.setAngle(angle);
    }
}

export class LandMine extends Projectile {
    name: ProjectileType = 'MINE';
    width = 20;
    height = 20;
    speed = 200;
    lifeTime = 15000;
    damage = false;
    armTime = 1500;
    explodeDistance = 140;
    shrapnelCount = 24;
    shrapnelSpeed = 359;
    shrapnelLifeTime = 300;
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
            (this.timeTriggered &&
                Date.now() - this.timeTriggered > this.triggerTime) ||
            this.lifeTime < Date.now() - this.timeFired
        ) {
            round.projectiles.splice(round.projectiles.indexOf(this), 1);

            for (
                let angle = 0;
                angle < 360;
                angle += 360 / this.shrapnelCount
            ) {
                let child = new Projectile(
                    this.position.copy(),
                    Velocity.fromAngle(angle, 135),
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

export class Laser extends Projectile {
    name: ProjectileType = 'LASER';
    width = 5;
    height = 5;
    speed = 1500;
    lifeTime = 1000;
    constructor(position: Position, velocity: Velocity, ownerId: string) {
        super(position, velocity, ownerId);

        this.velocity.setSpeed(this.speed);
    }

    update(round: Round) {
        super.update(round);
    }
}

export const ProjectileNames = {
    BULLET: Projectile,
    ROCKET: Rocket,
    LASER: Laser,
    AIRBURST: AirBurst,
    MINE: LandMine
};

export const ProjectileUses = {
    B: 0,
    R: 1,
    L: 3,
    A: 10,
    M: 5
};

export class PowerUp {
    id: string;
    position: Position;
    letter: 'B' | 'R' | 'L' | 'A' | 'M';
    type: ProjectileTypes;
    claimRadius = 50;
    constructor(
        position: Position,
        letter: 'B' | 'R' | 'L' | 'A' | 'M',
        type: any
    ) {
        this.position = position;
        this.letter = letter;
        this.type = type;

        this.id =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    checkClaim(round: Round) {
        let closestPlayer: Player | null = null;
        for (let player of round.players) {
            if (player.position.distanceTo(this.position) < this.claimRadius) {
                if (!closestPlayer) {
                    closestPlayer = player;
                } else if (
                    player.position.distanceTo(this.position) <
                    closestPlayer.position.distanceTo(this.position)
                ) {
                    closestPlayer = player;
                }
            }
        }

        if (closestPlayer) {
            closestPlayer.projectileType = this.type;
            closestPlayer.projectileUses = ProjectileUses[this.letter];
            round.powerups.splice(round.powerups.indexOf(this), 1);
        }
    }

    getCondensed(): CondensedPowerUp {
        return {
            id: this.id,
            position: this.position.getCondensed(),
            letter: this.letter
        };
    }

    static randomPowerUp(round: Round): PowerUp {
        // Get a random node for the powerup
        let node = round.map.getNode(
            Math.floor(Math.random() * round.map.width),
            Math.floor(Math.random() * round.map.height)
        );

        let position = node.position
            .copy()
            .moveBy(round.map.scale / 2, round.map.scale / 2);

        let powerType = Math.floor(Math.random() * 4);

        if (powerType == 0) {
            return new PowerUp(position, 'R', ProjectileNames.ROCKET);
        } else if (powerType == 3) {
            return new PowerUp(position, 'L', ProjectileNames.LASER);
        } else if (powerType == 2) {
            return new PowerUp(position, 'A', ProjectileNames.AIRBURST);
        } else if (powerType == 1) {
            return new PowerUp(position, 'M', ProjectileNames.MINE);
        }

        return new PowerUp(position, 'B', ProjectileNames.BULLET);
    }
}

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerUp = exports.ProjectileUses = exports.ProjectileNames = exports.Laser = exports.LandMine = exports.Rocket = exports.AirBurst = exports.Projectile = void 0;
var position_1 = require("./position");
var Projectile = /** @class */ (function () {
    function Projectile(position, velocity, ownerId) {
        this.name = 'BULLET';
        this.velocity = new position_1.Velocity(135, 135);
        this.collision = true;
        this.damage = true;
        this.lifeTime = 15000;
        this.timeFired = NaN;
        this.width = 10;
        this.height = 10;
        this.speed = 135;
        this.position = position;
        this.velocity = velocity;
        this.ownerId = ownerId;
        this.velocity = position_1.Velocity.fromAngle(velocity.getAngle(), this.speed);
        this.id =
            Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
        this.timeFired = Date.now();
    }
    Projectile.prototype.update = function (round) {
        var correctionFactor = 0.01;
        // Get the old node and position before the update
        var oldNode = round.map.getNodeFromPos(this.position);
        var oldPos = this.position.copy();
        // Update the position of the projectile based on its velocity
        this.position.updateByVelocity(this.velocity);
        if (this.timeFired + this.lifeTime < Date.now()) {
            round.projectiles.splice(round.projectiles.indexOf(this), 1);
        }
        if (this.damage) {
            // Check if the projectile hit a player
            for (var _i = 0, _a = round.players; _i < _a.length; _i++) {
                var player = _a[_i];
                if (!player.alive)
                    continue;
                if (player.collidePoint(this.position)) {
                    player.alive = false;
                    round.projectiles.splice(round.projectiles.indexOf(this), 1);
                }
            }
        }
        // Get the new node and position after the update
        var newNode = round.map.getNodeFromPos(this.position);
        var newPos = this.position.copy();
        // If the old or new node is null, or if the old and new node are the same or connected, return
        if (oldNode === null || newNode === null) {
        }
        else if (oldNode === newNode || oldNode.connected.includes(newNode)) {
            return;
        }
        // Calculate the slope of the line between the old and new position
        var slope = (newPos.y - oldPos.y) / (newPos.x - oldPos.x);
        // Calculate the horizontal and vertical boundaries of the current node
        var h1 = Math.floor(oldPos.y / round.map.scale) * round.map.scale;
        var h2 = Math.ceil(oldPos.y / round.map.scale) * round.map.scale;
        var v1 = Math.floor(oldPos.x / round.map.scale) * round.map.scale;
        var v2 = Math.ceil(oldPos.x / round.map.scale) * round.map.scale;
        // Calculate the intersection points of the line between the old and new position with the horizontal and vertical boundaries of the current node
        var x1 = (h1 - oldPos.y) / slope + oldPos.x;
        var x2 = (h2 - oldPos.y) / slope + oldPos.x;
        var y1 = (v1 - oldPos.x) * slope + oldPos.y;
        var y2 = (v2 - oldPos.x) * slope + oldPos.y;
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
    };
    Projectile.prototype.getCondensed = function () {
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
    };
    return Projectile;
}());
exports.Projectile = Projectile;
var AirBurst = /** @class */ (function (_super) {
    __extends(AirBurst, _super);
    function AirBurst(position, velocity, ownerId) {
        var _this = _super.call(this, position, velocity, ownerId) || this;
        _this.name = 'AIRBURST';
        _this.burstDelay = 1500;
        _this.childLifeTime = 2500;
        _this.splitAngleRange = 30;
        _this.childCount = 5;
        _this.childSpeed = 135;
        _this.speed = 150;
        _this.lifeTime = _this.burstDelay + _this.childLifeTime;
        _this.velocity.setSpeed(_this.speed);
        return _this;
    }
    AirBurst.prototype.update = function (round) {
        _super.prototype.update.call(this, round);
        if (Date.now() - this.timeFired > this.burstDelay && this.damage) {
            this.damage = false;
            this.collision = false;
            this.width = 0;
            this.height = 0;
            var angles = [];
            for (var i = 0; i < this.childCount; i++) {
                angles.push((this.splitAngleRange / (this.childCount - 1)) * i -
                    this.splitAngleRange / 2);
            }
            for (var _i = 0, angles_1 = angles; _i < angles_1.length; _i++) {
                var angle = angles_1[_i];
                var child = new Projectile(this.position.copy(), position_1.Velocity.fromAngle(this.velocity.getAngle() + angle, 135), this.ownerId);
                child.width = 5;
                child.height = 5;
                child.lifeTime = this.childLifeTime;
                child.ownerId = this.id;
                child.velocity.setSpeed(this.childSpeed);
                round.projectiles.push(child);
            }
        }
    };
    return AirBurst;
}(Projectile));
exports.AirBurst = AirBurst;
var Rocket = /** @class */ (function (_super) {
    __extends(Rocket, _super);
    function Rocket(position, velocity, ownerId) {
        var _this = _super.call(this, position, velocity, ownerId) || this;
        _this.name = 'ROCKET';
        _this.speed = 110;
        _this.width = 15;
        _this.height = 15;
        _this.correctionFactor = 3;
        _this.lockTime = 2500;
        _this.lastLock = 0;
        _this.targetPlayer = null;
        _this.goToNew = false;
        _this.lastNode = null;
        _this.velocity.setSpeed(_this.speed);
        _this.lastLock = Date.now();
        return _this;
    }
    Rocket.prototype.update = function (round) {
        _super.prototype.update.call(this, round);
        // Push velocity angle towards nearest player
        var nearestPlayer = round.players[0];
        var nearestDistance = Infinity;
        for (var _i = 0, _a = round.players; _i < _a.length; _i++) {
            var player = _a[_i];
            if (!player.alive)
                continue;
            var distance = this.position.distanceTo(player.position);
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
        }
        else {
            this.velocity.setSpeed(this.speed);
        }
        // BFS to the nearest players node
        var currentNode = round.map.getNodeFromPos(this.position);
        var targetNode = round.map.getNodeFromPos(this.targetPlayer.position);
        var queue = [currentNode];
        var visited = new Set();
        var parentMap = new Map();
        while (queue.length > 0) {
            var node = queue.shift();
            if (node == targetNode)
                break;
            if (!node)
                break;
            for (var _b = 0, _c = node.connected; _b < _c.length; _b++) {
                var neighbor = _c[_b];
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    parentMap.set(neighbor, node);
                }
            }
        }
        var path = [targetNode];
        var current = targetNode;
        while (current != currentNode) {
            current = parentMap.get(current);
            path.push(current);
        }
        var nextNode = path[path.length - 2];
        if (!nextNode)
            return;
        // If the distance to the current node's center is less than half the scale, move to the next node
        // Otherwise, move towards the center of the current node
        if (this.lastNode != currentNode) {
            this.goToNew = false;
            this.lastNode = currentNode;
        }
        var targetPos = this.position;
        if ((currentNode &&
            this.position.distanceTo(currentNode.position
                .copy()
                .moveBy(round.map.scale / 2, round.map.scale / 2)) <
                round.map.scale / 2) ||
            this.goToNew) {
            targetPos = nextNode.position
                .copy()
                .moveBy(round.map.scale / 2, round.map.scale / 2);
            this.goToNew = true;
        }
        else if (currentNode) {
            targetPos = currentNode.position
                .copy()
                .moveBy(round.map.scale / 2, round.map.scale / 2);
        }
        if (currentNode == targetNode) {
            targetPos = this.targetPlayer.position;
        }
        var angle = this.position.angleTo(targetPos);
        angle = (angle + 360) % 360;
        this.velocity.setAngle(angle);
    };
    return Rocket;
}(Projectile));
exports.Rocket = Rocket;
var LandMine = /** @class */ (function (_super) {
    __extends(LandMine, _super);
    function LandMine(position, velocity, ownerId) {
        var _this = _super.call(this, position, velocity, ownerId) || this;
        _this.name = 'MINE';
        _this.width = 20;
        _this.height = 20;
        _this.speed = 200;
        _this.lifeTime = 15000;
        _this.damage = false;
        _this.armTime = 1500;
        _this.explodeDistance = 140;
        _this.shrapnelCount = 24;
        _this.shrapnelSpeed = 359;
        _this.shrapnelLifeTime = 300;
        _this.triggerTime = 500;
        _this.timeTriggered = null;
        return _this;
    }
    LandMine.prototype.update = function (round) {
        _super.prototype.update.call(this, round);
        if (Date.now() < this.timeFired + this.armTime) {
            // Speed should linearly approach 0 over the course of the arm time
            this.velocity.setSpeed(this.speed * (1 - (Date.now() - this.timeFired) / this.armTime));
        }
        else {
            this.velocity.setSpeed(0);
        }
        if (Date.now() - this.timeFired > this.armTime) {
            this.damage = true;
            for (var _i = 0, _a = round.players; _i < _a.length; _i++) {
                var player = _a[_i];
                if (!player.alive)
                    continue;
                if (this.position.distanceTo(player.position) <
                    this.explodeDistance) {
                    if (!this.timeTriggered) {
                        this.timeTriggered = Date.now();
                    }
                }
            }
        }
        if ((this.timeTriggered &&
            Date.now() - this.timeTriggered > this.triggerTime) ||
            this.lifeTime < Date.now() - this.timeFired) {
            round.projectiles.splice(round.projectiles.indexOf(this), 1);
            for (var angle = 0; angle < 360; angle += 360 / this.shrapnelCount) {
                var child = new Projectile(this.position.copy(), position_1.Velocity.fromAngle(angle, 135), this.ownerId);
                child.width = 5;
                child.height = 5;
                child.lifeTime = this.shrapnelLifeTime;
                child.ownerId = this.id;
                child.velocity.setSpeed(this.shrapnelSpeed);
                round.projectiles.push(child);
            }
        }
    };
    return LandMine;
}(Projectile));
exports.LandMine = LandMine;
var Laser = /** @class */ (function (_super) {
    __extends(Laser, _super);
    function Laser(position, velocity, ownerId) {
        var _this = _super.call(this, position, velocity, ownerId) || this;
        _this.name = 'LASER';
        _this.width = 5;
        _this.height = 5;
        _this.speed = 1500;
        _this.lifeTime = 1000;
        _this.velocity.setSpeed(_this.speed);
        return _this;
    }
    Laser.prototype.update = function (round) {
        _super.prototype.update.call(this, round);
    };
    return Laser;
}(Projectile));
exports.Laser = Laser;
exports.ProjectileNames = {
    BULLET: Projectile,
    ROCKET: Rocket,
    LASER: Laser,
    AIRBURST: AirBurst,
    MINE: LandMine
};
exports.ProjectileUses = {
    B: 0,
    R: 1,
    L: 3,
    A: 10,
    M: 5
};
var PowerUp = /** @class */ (function () {
    function PowerUp(position, letter, type) {
        this.claimRadius = 50;
        this.position = position;
        this.letter = letter;
        this.type = type;
        this.id =
            Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
    }
    PowerUp.prototype.checkClaim = function (round) {
        var closestPlayer = null;
        for (var _i = 0, _a = round.players; _i < _a.length; _i++) {
            var player = _a[_i];
            if (player.position.distanceTo(this.position) < this.claimRadius) {
                if (!closestPlayer) {
                    closestPlayer = player;
                }
                else if (player.position.distanceTo(this.position) <
                    closestPlayer.position.distanceTo(this.position)) {
                    closestPlayer = player;
                }
            }
        }
        if (closestPlayer) {
            closestPlayer.projectileType = this.type;
            closestPlayer.projectileUses = exports.ProjectileUses[this.letter];
            round.powerups.splice(round.powerups.indexOf(this), 1);
        }
    };
    PowerUp.prototype.getCondensed = function () {
        return {
            id: this.id,
            position: this.position.getCondensed(),
            letter: this.letter
        };
    };
    PowerUp.randomPowerUp = function (round) {
        // Get a random node for the powerup
        var node = round.map.getNode(Math.floor(Math.random() * round.map.width), Math.floor(Math.random() * round.map.height));
        var position = node.position
            .copy()
            .moveBy(round.map.scale / 2, round.map.scale / 2);
        var powerType = Math.floor(Math.random() * 4);
        if (powerType == 0) {
            return new PowerUp(position, 'R', exports.ProjectileNames.ROCKET);
        }
        else if (powerType == 3) {
            return new PowerUp(position, 'L', exports.ProjectileNames.LASER);
        }
        else if (powerType == 2) {
            return new PowerUp(position, 'A', exports.ProjectileNames.AIRBURST);
        }
        else if (powerType == 1) {
            return new PowerUp(position, 'M', exports.ProjectileNames.MINE);
        }
        return new PowerUp(position, 'B', exports.ProjectileNames.BULLET);
    };
    return PowerUp;
}());
exports.PowerUp = PowerUp;

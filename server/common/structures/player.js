"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
var game_1 = require("./game");
var position_1 = require("./position");
var projectiles_1 = require("./projectiles");
/**
 * Represents a player in the game
 *
 * @param socket The socket that the player is connected to
 */
var Player = /** @class */ (function () {
    function Player(socket) {
        this.name = '';
        this.gameCode = '';
        this.position = new position_1.Position(0, 0);
        this.bodyAngle = 0;
        this.turretAngle = 0;
        this.host = false;
        this.width = 35;
        this.height = 35;
        this.alive = true;
        this.score = 0;
        this.projectileType = projectiles_1.ProjectileNames.BULLET;
        this.projectileUses = 0;
        this.socket = socket;
        this.id = socket.id;
    }
    /**
     * Sets up all the player related events that the player can listen to
     */
    Player.prototype.initializeEvents = function () {
        var _this = this;
        this.socket.on('set-name', function (data) {
            _this.setName(data.name);
            _this.sendUpdate();
        });
    };
    /**
     * Sends an update to the player with the current player state
     */
    Player.prototype.sendUpdate = function () {
        this.socket.emit('player-update', this.getCondensed());
    };
    /**
     * Handles the player disconnecting
     * - Removes the player from the game
     */
    Player.prototype.handleDisconnect = function () {
        var _a, _b;
        (_a = game_1.Game.getGameByCode(this.gameCode)) === null || _a === void 0 ? void 0 : _a.removePlayer(this);
        (_b = game_1.Game.getGameByCode(this.gameCode)) === null || _b === void 0 ? void 0 : _b.updatePlayerList();
    };
    /**
     * Sets the game code that the player is joining
     *
     * @param gameCode The game code that the player is joining
     */
    Player.prototype.setGameCode = function (gameCode) {
        this.gameCode = gameCode;
    };
    /**
     * Sets the name of the player and updates the player list
     *
     * @param name The name of the player
     */
    Player.prototype.setName = function (name) {
        var _a;
        this.name = name;
        (_a = game_1.Game.getGameByCode(this.gameCode)) === null || _a === void 0 ? void 0 : _a.updatePlayerList();
    };
    /**
     * Gets a condensed version of the player
     *
     * @returns A condensed version of the player
     * @see Game.getCondensedPlayerList
     */
    Player.prototype.getCondensed = function () {
        return {
            id: this.id,
            name: this.name,
            gameCode: this.gameCode,
            host: this.host,
            position: this.position.getCondensed(),
            bodyAngle: this.bodyAngle,
            turretAngle: this.turretAngle,
            width: this.width,
            height: this.height,
            alive: this.alive,
            score: this.score
        };
    };
    /**
     * Gets the 4 bounding points of the player accounting for the bodyAngle of the player
     *
     * @returns The 4 bounding points of the player
     */
    Player.prototype.getPoints = function () {
        var _this = this;
        var points = [
            this.position.copy().moveBy(-this.width / 2, -this.height / 2),
            this.position.copy().moveBy(this.width / 2, -this.height / 2),
            this.position.copy().moveBy(this.width / 2, this.height / 2),
            this.position.copy().moveBy(-this.width / 2, this.height / 2)
        ];
        return points.map(function (point) {
            return point.rotate(_this.position.x, _this.position.y, _this.bodyAngle);
        });
    };
    Player.prototype.getNonRotatedPoints = function () {
        var points = [
            this.position.copy().moveBy(-this.width / 2, -this.height / 2),
            this.position.copy().moveBy(this.width / 2, -this.height / 2),
            this.position.copy().moveBy(this.width / 2, this.height / 2),
            this.position.copy().moveBy(-this.width / 2, this.height / 2)
        ];
        return points;
    };
    Player.prototype.usedProjectile = function () {
        this.projectileUses--;
        if (this.projectileUses <= 0) {
            this.projectileType = projectiles_1.ProjectileNames.BULLET;
            this.projectileUses = 0;
        }
    };
    /**
     * Checks if a point is inside the player
     *
     * @param point The point to check
     *
     * @returns Whether or not the point is inside the player
     * @see https://en.wikipedia.org/wiki/Shoelace_formula
     */
    Player.prototype.collidePoint = function (point) {
        var points = this.getPoints();
        // Find area of quadrilateral by summing the areas of the 4 triangles
        var area = 0;
        for (var i = 0; i < 4; i++) {
            var j = (i + 1) % 4;
            area += points[i].x * points[j].y - points[j].x * points[i].y;
        }
        area = Math.abs(area / 2);
        // Find area of triangles to the point by summing the areas of the 4 triangles
        var areaToPoint = 0;
        for (var a = 0; a < 4; a++) {
            var b = (a + 1) % 4;
            areaToPoint += Math.abs((points[a].x - point.x) * (points[b].y - points[a].y) -
                (points[a].x - points[b].x) * (point.y - points[a].y));
        }
        areaToPoint = Math.abs(areaToPoint / 2);
        return Math.abs(areaToPoint - area) < 1;
    };
    Player.prototype.sendPosCorrection = function () {
        this.socket.emit('pos-correction', this.position.getCondensed());
    };
    Player.prototype.updatePosition = function (map, wallManager, targetPos) {
        var CORRECTION = this.width / 2 + 5;
        var currentX = this.position.x;
        var currentY = this.position.y;
        var topRightCorner = new position_1.Position(targetPos.x + CORRECTION, targetPos.y - CORRECTION);
        var topLeftCorner = new position_1.Position(targetPos.x - CORRECTION, targetPos.y - CORRECTION);
        var bottomRightCorner = new position_1.Position(targetPos.x + CORRECTION, targetPos.y + CORRECTION);
        var bottomLeftCorner = new position_1.Position(targetPos.x - CORRECTION, targetPos.y + CORRECTION);
        var topMiddlePoint = new position_1.Position(targetPos.x, targetPos.y - CORRECTION);
        var bottomMiddlePoint = new position_1.Position(targetPos.x, targetPos.y + CORRECTION);
        var leftMiddlePoint = new position_1.Position(targetPos.x - CORRECTION, targetPos.y);
        var rightMiddlePoint = new position_1.Position(targetPos.x + CORRECTION, targetPos.y);
        // Check movement direction
        var movingRight = targetPos.x > currentX;
        var movingLeft = targetPos.x < currentX;
        var movingUp = targetPos.y < currentY;
        var movingDown = targetPos.y > currentY;
        // Check collisions and prevent movement in collision directions
        var newX = targetPos.x;
        var newY = targetPos.y;
        if (movingUp && (wallManager.checkLineCollision(this.position, topLeftCorner) || wallManager.checkLineCollision(this.position, topMiddlePoint) || wallManager.checkLineCollision(this.position, topRightCorner) || wallManager.checkLineCollision(topLeftCorner, topRightCorner))) {
            // console.log("Up collision");
            newY = currentY;
        }
        if (movingDown && (wallManager.checkLineCollision(this.position, bottomLeftCorner) || wallManager.checkLineCollision(this.position, bottomMiddlePoint) || wallManager.checkLineCollision(this.position, bottomRightCorner) || wallManager.checkLineCollision(bottomLeftCorner, bottomRightCorner))) {
            // console.log("Down collision");
            newY = currentY;
        }
        if (movingRight && (wallManager.checkLineCollision(this.position, topRightCorner) || wallManager.checkLineCollision(this.position, rightMiddlePoint) || wallManager.checkLineCollision(this.position, bottomRightCorner) || wallManager.checkLineCollision(topRightCorner, bottomRightCorner))) {
            // console.log("Right collision");
            newX = currentX;
        }
        if (movingLeft && (wallManager.checkLineCollision(this.position, topLeftCorner) || wallManager.checkLineCollision(this.position, leftMiddlePoint) || wallManager.checkLineCollision(this.position, bottomLeftCorner) || wallManager.checkLineCollision(topLeftCorner, bottomLeftCorner))) {
            // console.log("Left collision");
            newX = currentX;
        }
        // Update position
        this.position.moveTo(newX, newY);
        this.sendPosCorrection();
    };
    return Player;
}());
exports.Player = Player;

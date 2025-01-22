"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Round = void 0;
var map_1 = require("./map");
var projectiles_1 = require("./projectiles");
var game_1 = require("./game");
var position_1 = require("./position");
var walls_1 = require("./walls");
/**
 * Represents one round of the game
 *
 * @param players The players in the round
 * @param roundNumber The round number
 */
var Round = /** @class */ (function () {
    function Round(gameCode, players, roundNumber) {
        var _a, _b;
        this.powerups = [];
        this.updateInterval = null;
        this.endRoundTimeout = null;
        this.gameCode = gameCode;
        this.players = players;
        this.roundNumber = roundNumber;
        this.projectiles = [];
        // Generate map with between 10 and 20 nodes in each direction
        var mapSize = (_b = (_a = game_1.Game.getGameByCode(this.gameCode)) === null || _a === void 0 ? void 0 : _a.gameSize) !== null && _b !== void 0 ? _b : 1;
        this.map = new map_1.Maze(2 + 2 * mapSize, 3 + 3 * mapSize, 100);
        this.map.removeWalls(Math.random() * mapSize * 0.15);
        this.wallManager = new walls_1.WallManager(this.map);
        this.initializePlayers();
    }
    Round.prototype.initializePlayers = function () {
        var _this = this;
        // Move each player to the middle of a random node, make sure another player isn't already there
        var usedNodes = new Set();
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            while (true) {
                // Get a random node
                var node = this.map.getNode(Math.floor(Math.random() * this.map.width), Math.floor(Math.random() * this.map.height));
                if (usedNodes.has(node)) {
                    continue;
                }
                usedNodes.add(node);
                // Set player position to the middle of the node
                player.position = node.position
                    .copy()
                    .moveBy(this.map.scale / 2, this.map.scale / 2);
                break;
            }
        }
        // Initialize event listeners for each player
        for (var _b = 0, _c = this.players; _b < _c.length; _b++) {
            var player = _c[_b];
            this.initializePlayerEvents(player);
            player.alive = true;
            player.projectileType = projectiles_1.ProjectileNames.BULLET;
            player.projectileUses = 0;
            player.sendUpdate();
        }
        game_1.Game.io.to(this.gameCode).emit('roundStart', this.getCondensed(true));
        this.updateInterval = setInterval(function () {
            var _a;
            // Update projectiles
            for (var _i = 0, _b = _this.projectiles; _i < _b.length; _i++) {
                var projectile = _b[_i];
                projectile.update(_this);
            }
            // Check if all players are dead
            var playersAlive = _this.players.filter(function (player) { return player.alive; }).length;
            if (playersAlive == 0) {
                (_a = game_1.Game.getGameByCode(_this.gameCode)) === null || _a === void 0 ? void 0 : _a.newRound(_this.roundNumber + 1);
                if (_this.endRoundTimeout === null) {
                    _this.endRoundTimeout = setTimeout(function () {
                        var _a;
                        (_a = game_1.Game.getGameByCode(_this.gameCode)) === null || _a === void 0 ? void 0 : _a.newRound(_this.roundNumber + 1);
                    }, 500000);
                }
            }
            else if (playersAlive == 1) {
            }
            if (Math.random() * 250 < 1) {
                _this.powerups.push(projectiles_1.PowerUp.randomPowerUp(_this));
            }
            for (var _c = 0, _d = _this.powerups; _c < _d.length; _c++) {
                var powerup = _d[_c];
                powerup.checkClaim(_this);
            }
            game_1.Game.io
                .to(_this.gameCode)
                .emit('roundUpdate', __assign(__assign({}, _this.getCondensed()), { map: null }));
        }, 1000 / 30);
    };
    /**
     * Initializes event listeners related to the round
     * @param player The player to initialize the listeners for
     */
    Round.prototype.initializePlayerEvents = function (player) {
        var _this = this;
        player.socket.on('events', function (data) {
            for (var _i = 0, _a = data.events; _i < _a.length; _i++) {
                var event_1 = _a[_i];
                // MOVE EVENT
                if (event_1.type === 'move') {
                    player.updatePosition(_this.map, _this.wallManager, position_1.Position.fromCondensed(event_1.position));
                    player.bodyAngle = event_1.bodyAngle;
                    player.turretAngle = event_1.turretAngle;
                    // SHOOT EVENT
                }
                else if (event_1.type === 'shoot' &&
                    _this.projectiles.filter(function (projectile) {
                        return projectile.ownerId === player.id;
                    }).length < 5 &&
                    player.alive) {
                    _this.projectiles.push(new player.projectileType(position_1.Position.fromCondensed(event_1.position), position_1.Velocity.fromAngle(event_1.turretAngle, 120), player.id));
                    player.usedProjectile();
                }
            }
        });
    };
    /**
     * Returns a condensed version of the round. This is used for sending data to the client.
     *
     * @param withMap - Whether to include the map or not.
     * @return The condensed round.
     */
    Round.prototype.getCondensed = function (withMap) {
        if (withMap === void 0) { withMap = false; }
        return {
            gameCode: this.gameCode,
            roundNumber: this.roundNumber,
            projectiles: this.projectiles.map(function (projectile) {
                return projectile.getCondensed();
            }),
            players: this.players.map(function (player) { return player.getCondensed(); }),
            powerups: this.powerups.map(function (powerup) { return powerup.getCondensed(); }),
            map: withMap ? this.map.getCondensed() : null
        };
    };
    Round.prototype.endRound = function () {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.endRoundTimeout) {
            clearTimeout(this.endRoundTimeout);
        }
        // If theres only on player left, give them a point
        var playersAlive = this.players.filter(function (player) { return player.alive; });
        if (playersAlive.length == 1) {
            playersAlive[0].score++;
        }
        // remove socket listeners
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            player.socket.removeAllListeners('events');
        }
    };
    return Round;
}());
exports.Round = Round;

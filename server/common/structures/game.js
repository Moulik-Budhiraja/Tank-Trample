"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var round_1 = require("./round");
/**
 * Represents a game that is being played
 * by multiple players
 *
 * @param io The socket.io instance
 */
var Game = /** @class */ (function () {
    function Game() {
        this.playerList = [];
        this.gameCode = this.generateGameCode();
        this.currentRound = new round_1.Round(this.gameCode, this.playerList, 0);
        this.gameSize = 1;
        Game.games.push(this);
    }
    /**
     * Generates a unique random 6 character game code
     *
     * @returns The generated game code
     */
    Game.prototype.generateGameCode = function () {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;
        for (var i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        if (Game.isGameCodeTaken(result)) {
            return this.generateGameCode();
        }
        return result;
    };
    /**
     * Adds a player to the game
     *
     * @param player The player to add to the game
     */
    Game.prototype.addPlayer = function (player) {
        this.playerList.push(player);
        if (this.playerList.length === 1) {
            player.host = true;
            player.sendUpdate();
        }
    };
    Game.prototype.changeGameSize = function (gameSize) {
        this.gameSize = gameSize;
    };
    /**
     * Removes a player from the game
     *
     * @param player The player to remove from the game
     */
    Game.prototype.removePlayer = function (player) {
        var _this = this;
        this.playerList = this.playerList.filter(function (p) { return p.id !== player.id; });
        if (player.host && this.playerList.length > 0) {
            this.playerList[0].host = true;
            this.playerList[0].sendUpdate();
        }
        if (this.playerList.length === 0) {
            this.currentRound.endRound();
            Game.games = Game.games.filter(function (g) { return g.gameCode !== _this.gameCode; });
        }
    };
    /**
     * Checks if the game's player list contains a player
     *
     * @param player The player to check if the game's player list contains
     * @returns Whether or not the game's player list contains the player
     */
    Game.prototype.hasPlayer = function (player) {
        for (var _i = 0, _a = this.playerList; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p.id === player.id) {
                return true;
            }
        }
        return false;
    };
    /**
     * Gets a list of condensed players
     *
     * @returns A list of condensed players
     * @see Player.getCondensed()
     */
    Game.prototype.getCondensedPlayerList = function () {
        return this.playerList.map(function (player) { return player.getCondensed(); });
    };
    /**
     * Sends a socket message to all the players in the game
     * to update their player list
     */
    Game.prototype.updatePlayerList = function () {
        if (this.playerList.length > 0) {
            Game.io.to(this.gameCode).emit('player-list', {
                players: this.getCondensedPlayerList()
            });
        }
    };
    /**
     * Ends the current round and starts a new one
     *
     * @param roundNumber The round number to start
     * @see Round.endRound()
     */
    Game.prototype.newRound = function (roundNumber) {
        this.currentRound.endRound();
        this.currentRound = new round_1.Round(this.gameCode, this.playerList, roundNumber);
    };
    /**
     * Checks if a game code is already taken
     * by another game
     *
     * @param gameCode The game code to check if it is taken
     * @returns Whether or not the game code is taken
     * @see Game.getGameByCode
     */
    Game.isGameCodeTaken = function (gameCode) {
        for (var _i = 0, _a = Game.games; _i < _a.length; _i++) {
            var game = _a[_i];
            if (game.gameCode === gameCode) {
                return true;
            }
        }
        return false;
    };
    /**
     * Gets a game by its game code
     *
     * @param gameCode The game code to get the game by
     * @returns The game with the game code
     */
    Game.getGameByCode = function (gameCode) {
        for (var _i = 0, _a = Game.games; _i < _a.length; _i++) {
            var game = _a[_i];
            if (game.gameCode === gameCode) {
                return game;
            }
        }
        return null;
    };
    /**
     * Sets up all game related events for a player
     *
     * @param player The player to set up the events for
     */
    Game.initializePlayerEvents = function (player) {
        var _this = this;
        player.socket.on('validate-game-code', function (data) {
            player.socket.emit('game-code-valid', {
                gameCode: data.gameCode,
                valid: _this.getGameByCode(data.gameCode) !== null
            });
        });
        player.socket.on('create-game', function () {
            var game = new Game();
            player.socket.emit('game-created', {
                gameCode: game.gameCode,
                valid: true
            });
        });
        player.socket.on('join-game', function (data) {
            var game = Game.getGameByCode(data.gameCode);
            if (game === null || game.hasPlayer(player)) {
                return;
            }
            player.setGameCode(data.gameCode);
            game === null || game === void 0 ? void 0 : game.addPlayer(player);
            // Join the game's socket room
            player.socket.join(data.gameCode);
            // Set name also updates the player list
            player.setName("Player ".concat(game === null || game === void 0 ? void 0 : game.playerList.length));
            player.sendUpdate();
        });
        player.socket.on('ping', function (data) {
            data.timeReceived = Date.now();
            player.socket.emit('pong', data);
        });
        player.socket.on('start-game', function () {
            var game = Game.getGameByCode(player.gameCode);
            if (game !== null && player.host && game.playerList.length >= 1) {
                Game.io.to(player.gameCode).emit('game-started');
                game.currentRound.endRound();
                game.currentRound = new round_1.Round(game.gameCode, game.playerList, 0);
            }
        });
        player.socket.on('update-game-size', function (data) {
            var game = Game.getGameByCode(player.gameCode);
            if (game !== null && player.host) {
                game.changeGameSize(data.size);
            }
        });
    };
    Game.games = [];
    return Game;
}());
exports.Game = Game;

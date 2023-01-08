import { Socket } from 'socket.io';
import { Player, CondensedPlayer } from './player';

/**
 * Represents the game code that the player is trying to join
 */
type GameValidation = {
    gameCode: string;
    valid: boolean;
};

/**
 * Represents a game that is being played
 * by multiple players
 *
 * @param io The socket.io instance
 */
export class Game {
    static games: Game[] = [];
    static io: any;
    gameCode: string;
    playerList: Player[] = [];

    constructor() {
        this.gameCode = this.generateGameCode();

        Game.games.push(this);
    }

    /**
     * Generates a unique random 6 character game code
     *
     * @returns The generated game code
     */
    generateGameCode(): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const charactersLength = characters.length;

        for (let i = 0; i < 6; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }

        if (Game.isGameCodeTaken(result)) {
            return this.generateGameCode();
        }

        return result;
    }

    /**
     * Adds a player to the game
     *
     * @param player The player to add to the game
     */
    addPlayer(player: Player) {
        this.playerList.push(player);
    }

    /**
     * Removes a player from the game
     *
     * @param player The player to remove from the game
     */
    removePlayer(player: Player) {
        this.playerList = this.playerList.filter((p) => p.id !== player.id);
    }

    /**
     * Checks if the game's player list contains a player
     *
     * @param player The player to check if the game's player list contains
     * @returns Whether or not the game's player list contains the player
     */
    hasPlayer(player: Player): boolean {
        for (let p of this.playerList) {
            if (p.id === player.id) {
                return true;
            }
        }

        return false;
    }

    /**
     * Gets a list of condensed players
     *
     * @returns A list of condensed players
     * @see Player.getCondensed()
     */
    getCondensedPlayerList(): CondensedPlayer[] {
        return this.playerList.map((player) => player.getCondensed());
    }

    /**
     * Sends a socket message to all the players in the game
     * to update their player list
     */
    updatePlayerList() {
        if (this.playerList.length > 0) {
            Game.io.to(this.gameCode).emit('player-list', {
                players: this.getCondensedPlayerList()
            });

            console.log('updated player list');
            console.table(this.getCondensedPlayerList());
        }
    }

    /**
     * Checks if a game code is already taken
     * by another game
     *
     * @param gameCode The game code to check if it is taken
     * @returns Whether or not the game code is taken
     * @see Game.getGameByCode
     */
    static isGameCodeTaken(gameCode: string): boolean {
        for (let game of Game.games) {
            if (game.gameCode === gameCode) {
                return true;
            }
        }

        return false;
    }

    /**
     * Gets a game by its game code
     *
     * @param gameCode The game code to get the game by
     * @returns The game with the game code
     */
    static getGameByCode(gameCode: string): Game | undefined {
        for (let game of Game.games) {
            if (game.gameCode === gameCode) {
                return game;
            }
        }

        return undefined;
    }

    /**
     * Sets up all game related events for a player
     *
     * @param player The player to set up the events for
     */
    static initializePlayerEvents(player: Player) {
        player.socket.on('validate-game-code', (data: GameValidation) => {
            player.socket.emit('game-code-valid', {
                gameCode: data.gameCode,
                valid: this.getGameByCode(data.gameCode) !== undefined
            });
        });

        player.socket.on('create-game', () => {
            let game = new Game();

            player.socket.emit('game-created', {
                gameCode: game.gameCode,
                valid: true
            });
        });

        player.socket.on('join-game', (data: GameValidation) => {
            let game = Game.getGameByCode(data.gameCode);
            if (game === undefined || game.hasPlayer(player)) {
                // ! TODO: THIS IS A WORKAROUND FIX LATER
                return;
            }

            player.setGameCode(data.gameCode);
            game?.addPlayer(player);

            console.log(`user ${player.id} joined game ${data.gameCode}`);
            console.table(game?.getCondensedPlayerList());

            // Join the game's socket room
            player.socket.join(data.gameCode);

            // Set name also updates the player list
            player.setName(`Player ${game?.playerList.length}`);
            player.sendName();
        });
    }
}

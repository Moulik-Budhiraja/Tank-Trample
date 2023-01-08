import { Socket } from 'socket.io';
import { Game } from './game';

/**
 * Represents the name that the player is setting
 * to themselves
 */
type Name = {
    name: string;
};

/**
 * Represents a condensed version of a player with
 * only the necessary information
 */
export type CondensedPlayer = {
    id: string;
    name: string;
    gameCode: string;
};

/**
 * Represents a player in the game
 *
 * @param socket The socket that the player is connected to
 */
export class Player {
    socket: Socket;
    id: string;
    name: string = '';
    gameCode: string = '';

    constructor(socket: Socket) {
        this.socket = socket;
        this.id = socket.id;
    }

    /**
     * Sets up all the player related events that the player can listen to
     */
    initializeEvents() {
        this.socket.on('set-name', (data: Name) => {
            this.name = data.name;
            console.log(`user ${this.id} set name to ${this.name}`);
            Game.getGameByCode(this.gameCode)?.updatePlayerList();
        });
    }

    /**
     * Sets the game code that the player is joining
     *
     * @param gameCode The game code that the player is joining
     */
    setGameCode(gameCode: string) {
        this.gameCode = gameCode;
    }

    /**
     * Gets a condensed version of the player
     *
     * @returns A condensed version of the player
     * @see Game.getCondensedPlayerList
     */
    getCondensed(): CondensedPlayer {
        return {
            id: this.id,
            name: this.name,
            gameCode: this.gameCode
        };
    }
}

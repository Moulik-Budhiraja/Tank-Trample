import { Socket } from 'socket.io';
import { Game } from './game';
import { Name, CondensedPlayer } from '../types/playerTypes';

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
            this.setName(data.name);
            this.sendName();
        });
    }

    /**
     * Handles the player disconnecting
     * - Removes the player from the game
     */
    handleDisconnect() {
        Game.getGameByCode(this.gameCode)?.removePlayer(this);
        Game.getGameByCode(this.gameCode)?.updatePlayerList();
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
     * Sets the name of the player and updates the player list
     *
     * @param name The name of the player
     */
    setName(name: string) {
        this.name = name;
        Game.getGameByCode(this.gameCode)?.updatePlayerList();
    }

    /**
     * Sends the current name of the player to the client
     */
    sendName() {
        this.socket.emit('current-name', {
            name: this.name
        });
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

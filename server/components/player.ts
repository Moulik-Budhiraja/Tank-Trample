import { Socket } from 'socket.io';
import { Game } from './game';

type Name = {
    name: string;
};

export type CondensedPlayer = {
    id: string;
    name: string;
    gameCode: string;
};

export class Player {
    socket: Socket;
    id: string;
    name: string = '';
    gameCode: string = '';

    constructor(socket: Socket) {
        this.socket = socket;
        this.id = socket.id;
    }

    initializeEvents() {
        this.socket.on('set-name', (data: Name) => {
            this.name = data.name;
            console.log(`user ${this.id} set name to ${this.name}`);
            Game.getGameByCode(this.gameCode)?.updatePlayerList();
        });
    }

    setGameCode(gameCode: string) {
        this.gameCode = gameCode;
    }

    getCondensed(): CondensedPlayer {
        return {
            id: this.id,
            name: this.name,
            gameCode: this.gameCode
        };
    }
}
    
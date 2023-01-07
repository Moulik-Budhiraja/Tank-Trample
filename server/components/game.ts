import { Socket } from 'socket.io';
import { Player, CondensedPlayer } from './player';

type GameValidation = {
    gameCode: string;
    valid: boolean;
};

export class Game {
    static games: Game[] = [];
    gameCode: string;
    playerList: Player[] = [];

    constructor() {
        this.gameCode = this.generateGameCode();

        Game.games.push(this);
    }

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

    addPlayer(player: Player) {
        this.playerList.push(player);
    }

    hasPlayer(player: Player): boolean {
        for (let p of this.playerList) {
            if (p.id === player.id) {
                return true;
            }
        }

        return false;
    }

    getCondensedPlayerList(): CondensedPlayer[] {
        return this.playerList.map((player) => player.getCondensed());
    }

    updatePlayerList() {
        if (this.playerList.length > 0) {
            this.playerList[0].socket.to(this.gameCode).emit('player-list', {
                players: this.getCondensedPlayerList()
            });

            console.log('updated player list');
        }
    }

    static isGameCodeTaken(gameCode: string): boolean {
        for (let game of Game.games) {
            if (game.gameCode === gameCode) {
                return true;
            }
        }

        return false;
    }

    static getGameByCode(gameCode: string): Game | undefined {
        for (let game of Game.games) {
            if (game.gameCode === gameCode) {
                return game;
            }
        }

        return undefined;
    }

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

            player.socket.join(data.gameCode);

            player.socket.to(player.gameCode).emit('player-list', {
                players: Game.getGameByCode(
                    player.gameCode
                )?.getCondensedPlayerList()
            });
        });
    }
}

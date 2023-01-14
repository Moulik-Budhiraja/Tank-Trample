import { Map } from './map';
import { Player } from './player';
import { MapNode } from './map';
import { Projectile } from './projectiles';
import { CondensedRound } from '../types/gameTypes';
import { CondensedPlayerList } from '../types/playerTypes';

/**
 * Represents one round of the game
 *
 * @param players The players in the round
 * @param roundNumber The round number
 */
export class Round {
    gameCode: string;
    players: Player[];
    projectiles: Projectile[] = [];
    roundNumber: number;
    map: Map;

    constructor(gameCode: string, players: Player[], roundNumber: number) {
        this.gameCode = gameCode;
        this.players = players;
        this.roundNumber = roundNumber;

        // Generate map with between 10 and 20 nodes in each direction
        this.map = new Map(
            Math.floor(Math.random() * 10) + 10,
            Math.floor(Math.random() * 10) + 10
        );
    }

    initializePlayers() {
        // Move each player to the middle of a random node, make sure another player isn't already there
        let usedNodes: Set<MapNode> = new Set();

        for (let player of this.players) {
            while (true) {
                // Get a random node
                let node = this.map.getNode(
                    Math.floor(Math.random() * this.map.height),
                    Math.floor(Math.random() * this.map.width)
                );

                if (usedNodes.has(node)) {
                    continue;
                }
                usedNodes.add(node);

                // Set player position to the middle of the node
                player.position = node.position.moveBy(
                    this.map.scale / 2,
                    this.map.scale / 2
                );
                break;
            }
        }
    }

    getCondensed(): CondensedRound {
        return {
            gameCode: this.gameCode,
            roundNumber: this.roundNumber,
            projectiles: this.projectiles,
            players: this.players.map((player) => player.getCondensed()),
            map: this.map
        };
    }
}

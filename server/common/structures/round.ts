import { Map } from './map';
import { Player } from './player';
import { MapNode } from './map';
import { Projectile } from './projectiles';
import { CondensedRound, GameEvent } from '../types/gameTypes';
import { Game } from './game';
import { Position, Velocity } from './position';

/**
 * Represents one round of the game
 *
 * @param players The players in the round
 * @param roundNumber The round number
 */
export class Round {
    gameCode: string;
    players: Player[];
    projectiles: Projectile[];
    roundNumber: number;
    map: Map;
    updateInterval: NodeJS.Timeout | null = null;

    constructor(gameCode: string, players: Player[], roundNumber: number) {
        this.gameCode = gameCode;
        this.players = players;
        this.roundNumber = roundNumber;
        this.projectiles = [];

        // Generate map with between 10 and 20 nodes in each direction
        this.map = new Map(4, 6, 100);

        this.initializePlayers();
    }

    initializePlayers() {
        // Move each player to the middle of a random node, make sure another player isn't already there
        let usedNodes: Set<MapNode> = new Set();

        for (let player of this.players) {
            while (true) {
                // Get a random node
                let node = this.map.getNode(
                    Math.floor(Math.random() * this.map.width),
                    Math.floor(Math.random() * this.map.height)
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

        // Initialize event listeners for each player
        for (let player of this.players) {
            this.initializePlayerEvents(player);

            player.sendUpdate();
        }

        Game.io.to(this.gameCode).emit('roundStart', this.getCondensed(true));

        this.updateInterval = setInterval(() => {
            // Update projectiles
            for (let projectile of this.projectiles) {
                projectile.update(this.map);

                if (projectile.timeFired + projectile.lifeTime < Date.now()) {
                    this.projectiles.splice(
                        this.projectiles.indexOf(projectile),
                        1
                    );
                }

                // Check if the projectile hit a player
                for (let player of this.players) {
                    if (player.collidePoint(projectile.position)) {
                        player.alive = false;

                        console.log(
                            `${player.name} at ${
                                player.position.x + ' ' + player.position.y
                            } was killed by a projectile at ${
                                projectile.position.x +
                                ' ' +
                                projectile.position.y
                            }`
                        );

                        this.projectiles.splice(
                            this.projectiles.indexOf(projectile),
                            1
                        );
                    }
                }
            }

            Game.io
                .to(this.gameCode)
                .emit('roundUpdate', { ...this.getCondensed(), map: null });
        }, 1000 / 30);
    }

    /**
     * Initializes event listeners related to the round
     * @param player The player to initialize the listeners for
     */
    initializePlayerEvents(player: Player) {
        player.socket.on('events', (data: { events: GameEvent[] }) => {
            for (let event of data.events) {
                // MOVE EVENT
                if (event.type === 'move') {
                    player.position = Position.fromCondensed(event.position);
                    player.bodyAngle = event.bodyAngle;
                    player.turretAngle = event.turretAngle;

                    // SHOOT EVENT
                } else if (
                    event.type === 'shoot' &&
                    this.projectiles.length < 5
                ) {
                    this.projectiles.push(
                        new Projectile(
                            Position.fromCondensed(event.position),
                            Velocity.fromAngle(event.turretAngle, 100),
                            player.id
                        )
                    );
                }
            }
        });
    }

    getCondensed(withMap: boolean = false): CondensedRound {
        return {
            gameCode: this.gameCode,
            roundNumber: this.roundNumber,
            projectiles: this.projectiles.map((projectile) =>
                projectile.getCondensed()
            ),
            players: this.players.map((player) => player.getCondensed()),
            map: withMap ? this.map.getCondensed() : null
        };
    }

    endRound() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // remove socket listeners
        for (let player of this.players) {
            player.socket.removeAllListeners('events');
        }
    }
}

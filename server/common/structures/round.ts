import { Maze } from './map';
import { Player } from './player';
import { MapNode } from './map';
import {
    AirBurst,
    LandMine,
    Laser,
    PowerUp,
    Projectile,
    ProjectileNames,
    Rocket
} from './projectiles';
import { CondensedRound, GameEvent } from '../types/gameTypes';
import { Game } from './game';
import { Position, Velocity } from './position';
import { WallManager } from './walls';

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
    powerups: PowerUp[] = [];
    roundNumber: number;
    map: Maze;
    wallManager: WallManager;
    updateInterval: NodeJS.Timeout | null = null;
    endRoundTimeout: NodeJS.Timeout | null = null;

    constructor(gameCode: string, players: Player[], roundNumber: number) {
        this.gameCode = gameCode;
        this.players = players;
        this.roundNumber = roundNumber;
        this.projectiles = [];

        // Generate map with between 10 and 20 nodes in each direction
        const mapSize = Game.getGameByCode(this.gameCode)?.gameSize ?? 1;
        this.map = new Maze(2 + 2 * mapSize, 3 + 3 * mapSize, 100);

        this.map.removeWalls(Math.random() * mapSize * 0.15);

        this.wallManager = new WallManager(this.map);

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
                player.position = node.position
                    .copy()
                    .moveBy(this.map.scale / 2, this.map.scale / 2);
                break;
            }
        }

        // Initialize event listeners for each player
        for (let player of this.players) {
            this.initializePlayerEvents(player);
            player.alive = true;
            player.projectileType = ProjectileNames.BULLET;
            player.projectileUses = 0;

            player.sendUpdate();
        }

        Game.io.to(this.gameCode).emit('roundStart', this.getCondensed(true));

        this.updateInterval = setInterval(() => {
            // Update projectiles
            for (let projectile of this.projectiles) {
                projectile.update(this);
            }

            // Check if all players are dead
            let playersAlive = this.players.filter(
                (player) => player.alive
            ).length;

            if (playersAlive == 0) {
                Game.getGameByCode(this.gameCode)?.newRound(
                    this.roundNumber + 1
                );
                if (this.endRoundTimeout === null) {
                    this.endRoundTimeout = setTimeout(() => {
                        Game.getGameByCode(this.gameCode)?.newRound(
                            this.roundNumber + 1
                        );
                    }, 500000);
                }
            } else if (playersAlive == 1) {
            }

            if (Math.random() * 250 < 1) {
                this.powerups.push(PowerUp.randomPowerUp(this));
            }

            for (let powerup of this.powerups) {
                powerup.checkClaim(this);
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
                    player.updatePosition(
                        this.map,
                        this.wallManager,
                        Position.fromCondensed(event.position)
                    );
                    player.bodyAngle = event.bodyAngle;
                    player.turretAngle = event.turretAngle;

                    // SHOOT EVENT
                } else if (
                    event.type === 'shoot' &&
                    this.projectiles.filter((projectile) => {
                        return projectile.ownerId === player.id;
                    }).length < 5 &&
                    player.alive
                ) {
                    this.projectiles.push(
                        new player.projectileType(
                            Position.fromCondensed(event.position),
                            Velocity.fromAngle(event.turretAngle, 120),
                            player.id
                        )
                    );
                    player.usedProjectile();
                }
            }
        });
    }

    /**
     * Returns a condensed version of the round. This is used for sending data to the client.
     *
     * @param withMap - Whether to include the map or not.
     * @return The condensed round.
     */
    getCondensed(withMap: boolean = false): CondensedRound {
        return {
            gameCode: this.gameCode,
            roundNumber: this.roundNumber,
            projectiles: this.projectiles.map((projectile) =>
                projectile.getCondensed()
            ),
            players: this.players.map((player) => player.getCondensed()),
            powerups: this.powerups.map((powerup) => powerup.getCondensed()),
            map: withMap ? this.map.getCondensed() : null
        };
    }

    endRound() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        if (this.endRoundTimeout) {
            clearTimeout(this.endRoundTimeout);
        }

        // If theres only on player left, give them a point
        let playersAlive = this.players.filter((player) => player.alive);
        if (playersAlive.length == 1) {
            playersAlive[0].score++;
        }

        // remove socket listeners
        for (let player of this.players) {
            player.socket.removeAllListeners('events');
        }
    }
}

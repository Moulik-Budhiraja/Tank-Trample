import { Socket } from 'socket.io';
import { Game } from './game';
import { CondensedPlayer } from '../types/playerTypes';
import { Position } from './position';
import { Maze } from './map';
import { Projectile, ProjectileNames } from './projectiles';
import { WallManager } from './walls';

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
    position: Position = new Position(0, 0);
    bodyAngle: number = 0;
    turretAngle: number = 0;
    host: boolean = false;
    width: number = 35;
    height: number = 35;
    alive: boolean = true;
    score: number = 0;
    projectileType: any = ProjectileNames.BULLET;
    projectileUses: number = 0;
    private lastLogTime?: number;

    constructor(socket: Socket) {
        this.socket = socket;
        this.id = socket.id;
    }

    /**
     * Sets up all the player related events that the player can listen to
     */
    initializeEvents() {
        this.socket.on('set-name', (data: CondensedPlayer) => {
            this.setName(data.name);
            this.sendUpdate();
        });
    }

    /**
     * Sends an update to the player with the current player state
     */
    sendUpdate() {
        this.socket.emit('player-update', this.getCondensed());
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
     * Gets a condensed version of the player
     *
     * @returns A condensed version of the player
     * @see Game.getCondensedPlayerList
     */
    getCondensed(): CondensedPlayer {
        return {
            id: this.id,
            name: this.name,
            gameCode: this.gameCode,
            host: this.host,
            position: this.position.getCondensed(),
            bodyAngle: this.bodyAngle,
            turretAngle: this.turretAngle,
            width: this.width,
            height: this.height,
            alive: this.alive,
            score: this.score
        };
    }

    /**
     * Gets the 4 bounding points of the player accounting for the bodyAngle of the player
     *
     * @returns The 4 bounding points of the player
     */
    getPoints(): Position[] {
        let points = [
            this.position.copy().moveBy(-this.width / 2, -this.height / 2),
            this.position.copy().moveBy(this.width / 2, -this.height / 2),
            this.position.copy().moveBy(this.width / 2, this.height / 2),
            this.position.copy().moveBy(-this.width / 2, this.height / 2)
        ];

        return points.map((point) =>
            point.rotate(this.position.x, this.position.y, this.bodyAngle)
        );
    }

    getNonRotatedPoints(): Position[] {
        let points = [
            this.position.copy().moveBy(-this.width / 2, -this.height / 2),
            this.position.copy().moveBy(this.width / 2, -this.height / 2),
            this.position.copy().moveBy(this.width / 2, this.height / 2),
            this.position.copy().moveBy(-this.width / 2, this.height / 2)
        ];

        return points;
    }

    usedProjectile() {
        this.projectileUses--;

        if (this.projectileUses <= 0) {
            this.projectileType = ProjectileNames.BULLET;
            this.projectileUses = 0;
        }
    }

    /**
     * Checks if a point is inside the player
     *
     * @param point The point to check
     *
     * @returns Whether or not the point is inside the player
     * @see https://en.wikipedia.org/wiki/Shoelace_formula
     */
    collidePoint(point: Position): boolean {
        let points = this.getPoints();

        // Find area of quadrilateral by summing the areas of the 4 triangles

        let area = 0;

        for (let i = 0; i < 4; i++) {
            let j = (i + 1) % 4;

            area += points[i].x * points[j].y - points[j].x * points[i].y;
        }

        area = Math.abs(area / 2);

        // Find area of triangles to the point by summing the areas of the 4 triangles

        let areaToPoint = 0;

        for (let a = 0; a < 4; a++) {
            let b = (a + 1) % 4;

            areaToPoint += Math.abs(
                (points[a].x - point.x) * (points[b].y - points[a].y) -
                    (points[a].x - points[b].x) * (point.y - points[a].y)
            );
        }

        areaToPoint = Math.abs(areaToPoint / 2);

        return Math.abs(areaToPoint - area) < 1;
    }

    sendPosCorrection() {
        this.socket.emit('pos-correction', this.position.getCondensed());
    }

    updatePosition(map: Maze, wallManager: WallManager, targetPos: Position) {
        const CORRECTION = this.width / 2 + 5; 

        const currentX = this.position.x;
        const currentY = this.position.y;
        
        const topRightCorner = new Position(targetPos.x + CORRECTION, targetPos.y - CORRECTION);
        const topLeftCorner = new Position(targetPos.x  - CORRECTION, targetPos.y - CORRECTION);
        const bottomRightCorner = new Position(targetPos.x  + CORRECTION, targetPos.y + CORRECTION);
        const bottomLeftCorner = new Position(targetPos.x   - CORRECTION, targetPos.y + CORRECTION);
        const topMiddlePoint = new Position(targetPos.x, targetPos.y - CORRECTION); 
        const bottomMiddlePoint = new Position(targetPos.x, targetPos.y + CORRECTION); 
        const leftMiddlePoint = new Position(targetPos.x - CORRECTION, targetPos.y); 
        const rightMiddlePoint = new Position(targetPos.x + CORRECTION, targetPos.y); 

        // Check movement direction
        const movingRight = targetPos.x > currentX;
        const movingLeft = targetPos.x < currentX;
        const movingUp = targetPos.y < currentY;
        const movingDown = targetPos.y > currentY;

        // Check collisions and prevent movement in collision directions
        let newX = targetPos.x;
        let newY = targetPos.y;
        
        if (movingUp && (wallManager.checkLineCollision(this.position, topLeftCorner) || wallManager.checkLineCollision(this.position, topMiddlePoint) || wallManager.checkLineCollision(this.position, topRightCorner) || wallManager.checkLineCollision(topLeftCorner, topRightCorner))) {
            // console.log("Up collision");
            newY = currentY;
        }
        if (movingDown && (wallManager.checkLineCollision(this.position, bottomLeftCorner) || wallManager.checkLineCollision(this.position, bottomMiddlePoint) || wallManager.checkLineCollision(this.position, bottomRightCorner) || wallManager.checkLineCollision(bottomLeftCorner, bottomRightCorner))) {
            // console.log("Down collision");
            newY = currentY;
        }
        if (movingRight && (wallManager.checkLineCollision(this.position, topRightCorner) || wallManager.checkLineCollision(this.position, rightMiddlePoint) || wallManager.checkLineCollision(this.position, bottomRightCorner) || wallManager.checkLineCollision(topRightCorner, bottomRightCorner))) {
            // console.log("Right collision");
            newX = currentX;
        }
        if (movingLeft && (wallManager.checkLineCollision(this.position, topLeftCorner) || wallManager.checkLineCollision(this.position, leftMiddlePoint) || wallManager.checkLineCollision(this.position, bottomLeftCorner) || wallManager.checkLineCollision(topLeftCorner, bottomLeftCorner))) {
            // console.log("Left collision");
            newX = currentX;
        }


        

        // Update position
        this.position.moveTo(newX, newY);
        this.sendPosCorrection();
    }
}

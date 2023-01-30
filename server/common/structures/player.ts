import { Socket } from 'socket.io';
import { Game } from './game';
import { CondensedPlayer } from '../types/playerTypes';
import { Position } from './position';
import { Maze } from './map';
import { Projectile, ProjectileNames } from './projectiles';

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

    updatePosition(map: Maze, targetPos: Position) {
        let points = this.getNonRotatedPoints();


        let dx = targetPos.x - this.position.x;
        let dy = targetPos.y - this.position.y;
        const correctionFactor = 0.5;

        for (let oldPos of points) {
            let newPos = new Position(oldPos.x + dx, oldPos.y + dy);
            let oldNode = map.getNodeFromPos(oldPos);
            let newNode = map.getNodeFromPos(newPos);

            if (oldNode === null || newNode === null) {
            } else if (oldNode === newNode || oldNode.connected.includes(newNode)) {
                continue;
            } 
    
            // Calculate the slope of the line between the old and new position
            let slope = (newPos.y - oldPos.y) / (newPos.x - oldPos.x);
    
            // Calculate the horizontal and vertical boundaries of the current node
            let h1 = Math.floor(oldPos.y / map.scale) * map.scale;
            let h2 = Math.ceil(oldPos.y / map.scale) * map.scale;
            let v1 = Math.floor(oldPos.x / map.scale) * map.scale;
            let v2 = Math.ceil(oldPos.x / map.scale) * map.scale;
    
            // Calculate the intersection points of the line between the old and new position with the horizontal and vertical boundaries of the current node
            let x1 = (h1 - oldPos.y) / slope + oldPos.x;
            let x2 = (h2 - oldPos.y) / slope + oldPos.x;
            let y1 = (v1 - oldPos.x) * slope + oldPos.y;
            let y2 = (v2 - oldPos.x) * slope + oldPos.y;
    
            // Check if the intersection points are within the boundaries of the current node, and if the new position is on the opposite side of the boundary as the old position
            // If so, update the position to the intersection point and reverse the velocity in the appropriate direction
    
            // Top boundary
            if (v1 < x1 && x1 < v2 && newPos.y < h1 && h1 < oldPos.y) {
                dx = x1 - oldPos.x;
                dy = h1 - oldPos.y;
                
                this.position.moveBy(dx, dy + correctionFactor);
                this.sendPosCorrection();
                console.log(this.position.x, this.position.y, dx, dy, slope)
                return;
            }
            // Bottom boundary
            if (v1 < x2 && x2 < v2 && oldPos.y < h2 && h2 < newPos.y) {
                dx = x2 - oldPos.x;
                dy = h2 - oldPos.y;
                
                this.position.moveBy(dx, dy - correctionFactor);
                this.sendPosCorrection();
                console.log(this.position.x, this.position.y, dx, dy, slope)
                return;
            }
            // Left boundary
            if (h1 < y1 && y1 < h2 && newPos.x < v1 && v1 < oldPos.x) {
                dx = v1 - oldPos.x;
                dy = y1 - oldPos.y;
                
                this.position.moveBy(dx + correctionFactor, dy);
                this.sendPosCorrection();
                console.log(this.position.x, this.position.y, dx, dy, slope)
                return;
            }
            // Right boundary
            if (h1 < y2 && y2 < h2 && oldPos.x < v2 && v2 < newPos.x) {
                dx = v2 - oldPos.x;
                dy = y2 - oldPos.y;
                
                this.position.moveBy(dx - correctionFactor, dy);
                this.sendPosCorrection();
                console.log(this.position.x, this.position.y, dx, dy, slope)
                return;
            }
        }

        this.position.moveTo(targetPos.x, targetPos.y);
    }
}

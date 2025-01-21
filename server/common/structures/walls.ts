import { Position } from './position';
import { Maze } from './map';

interface Wall {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export class WallManager {
    private walls: Wall[];
    
    constructor(maze: Maze) {
        this.walls = [];
        this.generateWalls(maze);
    }

    private generateWalls(maze: Maze) {
        // Add border walls
        this.walls.push(
            { x1: 0, y1: 0, x2: maze.width * maze.scale, y2: 0 },  // Top
            { x1: maze.width * maze.scale, y1: 0, x2: maze.width * maze.scale, y2: maze.height * maze.scale },  // Right
            { x1: maze.width * maze.scale, y1: maze.height * maze.scale, x2: 0, y2: maze.height * maze.scale },  // Bottom
            { x1: 0, y1: maze.height * maze.scale, x2: 0, y2: 0 }  // Left
        );

        // Add internal walls
        for (let i = 0; i < maze.height; i++) {
            for (let j = 0; j < maze.width; j++) {
                const node = maze.nodes[i][j];
                
                // Check north wall
                if (!node.connected.includes(maze.nodes[i - 1]?.[j])) {
                    this.walls.push({
                        x1: j * maze.scale,
                        y1: i * maze.scale,
                        x2: (j + 1) * maze.scale,
                        y2: i * maze.scale
                    });
                }
                
                // Check west wall
                if (!node.connected.includes(maze.nodes[i]?.[j - 1])) {
                    this.walls.push({
                        x1: j * maze.scale,
                        y1: i * maze.scale,
                        x2: j * maze.scale,
                        y2: (i + 1) * maze.scale
                    });
                }
            }
        }
    }

    /**
     * Checks if a line segment intersects with any wall
     * @param start Start position of the line segment
     * @param end End position of the line segment
     * @returns true if there's an intersection, false otherwise
     */
    checkLineCollision(start: Position, end: Position): boolean {
        for (const wall of this.walls) {
            if (this.lineIntersects(
                start.x, start.y, end.x, end.y,
                wall.x1, wall.y1, wall.x2, wall.y2
            )) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if two line segments intersect
     * Uses the line-line intersection algorithm
     */
    private lineIntersects(
        x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number, x4: number, y4: number
    ): boolean {
        // Calculate denominators
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0) return false;  // Lines are parallel

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    
    /**
     * Gets the four corners of a player given their position, dimensions, and rotation
     */


    /**
     * Gets all walls for debugging or rendering purposes
     */
    getWalls(): Wall[] {
        return [...this.walls];
    }
} 
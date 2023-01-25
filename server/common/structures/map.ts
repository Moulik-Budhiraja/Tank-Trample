import { Position } from './position';
import { CondensedMap, CondensedMapNode } from '../types/mapTypes';

/**
 * Represents a node in a maze
 *
 * @param id The id of the node
 * @param x The x position of the node
 * @param y The y position of the node
 */
export class MapNode {
    id: number;
    neighbours: MapNode[];
    connected: MapNode[];
    position: Position;

    constructor(id: number, x: number, y: number) {
        this.id = id;
        this.neighbours = [];
        this.connected = [];

        this.position = new Position(x, y);
    }

    getCondensed(): CondensedMapNode {
        let connected = {
            left: false,
            right: false,
            up: false,
            down: false
        };

        for (let node of this.connected) {
            if (node.position.x < this.position.x) connected.left = true;
            if (node.position.x > this.position.x) connected.right = true;
            if (node.position.y < this.position.y) connected.up = true;
            if (node.position.y > this.position.y) connected.down = true;
        }

        return {
            id: this.id,
            position: this.position.getCondensed(),
            connected: connected
        };
    }
}

/**
 * Represents the Map as a 2D array of Nodes
 * An edge between two nodes indicates there is no wall between them
 *
 * @param length The length of the map
 * @param width The width of the map
 * @param scale The scale of the map, side length of one square in pixels
 */
export class Map {
    height: number;
    width: number;
    scale: number;
    nodes: MapNode[][];

    constructor(length: number, width: number, scale: number = 100) {
        this.height = length;
        this.width = width;
        this.scale = scale;
        this.nodes = [];

        this.populateNodes();
        this.generateMaze();
    }

    /**
     * Creates an empty graph with length * width nodes
     * Stores those nodes in a length by width 2D array
     * Sets adjacent nodes as neighbours
     */
    populateNodes() {
        this.nodes = [];
        for (let i = 0; i < this.height; i++) {
            let row: MapNode[] = [];
            for (let j = 0; j < this.width; j++) {
                row.push(
                    new MapNode(
                        i * this.width + j,
                        j * this.scale,
                        i * this.scale
                    )
                );
            }
            this.nodes.push(row);
        }

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let node = this.nodes[i][j];
                if (i > 0) {
                    node.neighbours.push(this.nodes[i - 1][j]);
                }
                if (i < this.height - 1) {
                    node.neighbours.push(this.nodes[i + 1][j]);
                }
                if (j > 0) {
                    node.neighbours.push(this.nodes[i][j - 1]);
                }
                if (j < this.width - 1) {
                    node.neighbours.push(this.nodes[i][j + 1]);
                }
            }
        }
    }

    /**
     * Generates a maze from an empty maze using the randomized Prim's algorithm
     * Creates a minimum spanning tree, meaning all nodes are accessible
     */
    generateMaze() {
        let node =
            this.nodes[Math.floor(Math.random() * this.height)][
                Math.floor(Math.random() * this.width)
            ];
        let border: MapNode[] = [];
        let inside: MapNode[] = [node];

        for (let neighbour of node.neighbours) {
            border.push(neighbour);
        }

        while (border.length > 0) {
            let index = Math.floor(Math.random() * border.length);
            let node = border[index];
            border.splice(index, 1);

            while (true) {
                let neighbour =
                    node.neighbours[
                        Math.floor(Math.random() * node.neighbours.length)
                    ];
                if (inside.includes(neighbour)) {
                    node.connected.push(neighbour);
                    neighbour.connected.push(node);
                    inside.push(node);
                    break;
                }
            }

            for (let neighbour of node.neighbours) {
                if (
                    !inside.includes(neighbour) &&
                    !border.includes(neighbour)
                ) {
                    border.push(neighbour);
                }
            }
        }
    }

    /**
     * Randomly removes walls from the maze based specified openness
     *
     * @param openness A number between 0 to 1, with 0 making no changes and 1 being an empty box
     */
    removeWalls(openness: number) {
        let maxEdges = this.height * this.width * 2 - this.height - this.width;
        let edges = this.height * this.width - 1;
        let toAdd = Math.floor((maxEdges - edges) * openness);

        for (let i = 0; i < toAdd; i++) {
            let node: MapNode;
            while (true) {
                let row = Math.floor(Math.random() * this.height);
                let col = Math.floor(Math.random() * this.width);
                node = this.nodes[row][col];
                if (node.neighbours.length > node.connected.length) {
                    break;
                }
            }
            let neighbour: MapNode;
            while (true) {
                neighbour =
                    node.neighbours[
                        Math.floor(Math.random() * node.neighbours.length)
                    ];
                if (!node.connected.includes(neighbour)) {
                    break;
                }
            }
            node.connected.push(neighbour);
            neighbour.connected.push(node);
        }
    }

    /**
     * Generates an SVG representation of the map using paths
     *
     * @returns A string containing path data for the SVG
     */
    generateSVG() {
        let data = '';

        // draw the border
        data += `M0 0 L${this.width * this.scale} 0 `;
        data += `L${this.width * this.scale} ${this.height * this.scale} `;
        data += `L0 ${this.height * this.scale} `;
        data += `L0 0 `;

        // use paths to draw the walls
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let node = this.nodes[i][j];
                if (!node.connected.includes(this.nodes[i - 1]?.[j])) {
                    // draw north wall
                    data += `M${j * this.scale} ${i * this.scale} `;
                    data += `L${(j + 1) * this.scale} ${i * this.scale} `;
                }
                if (!node.connected.includes(this.nodes[i]?.[j - 1])) {
                    // draw west wall
                    data += `M${j * this.scale} ${i * this.scale} `;
                    data += `L${j * this.scale} ${(i + 1) * this.scale} `;
                }
                if (!node.connected.includes(this.nodes[i + 1]?.[j])) {
                    // draw south wall
                    data += `M${j * this.scale} ${(i + 1) * this.scale} `;
                    data += `L${(j + 1) * this.scale} ${(i + 1) * this.scale} `;
                }
                if (!node.connected.includes(this.nodes[i]?.[j + 1])) {
                    // draw east wall
                    data += `M${(j + 1) * this.scale} ${i * this.scale} `;
                    data += `L${(j + 1) * this.scale} ${(i + 1) * this.scale} `;
                }
            }
        }

        return data;
    }

    /**
     * Gets a node from an x and y coordinate
     *
     * @param x The x coordinate of the node
     * @param y The y coordinate of the node
     * @returns MapNode The node at the specified coordinates
     */
    getNode(x: number, y: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new Error(
                `Invalid node coordinates (x=${x}, y=${y}) for map of size (width=${this.width}, height=${this.height}`
            );
        }

        return this.nodes[y][x];
    }

    /**
     * Takes a position and returns the node that position is in
     *
     * @param pos A position on the map
     * @returns MapNode The node that the position is in
     */
    getNodeFromPos(pos: Position) {
        if (pos.x < 0 || pos.x >= this.width * this.scale) return null;
        if (pos.y < 0 || pos.y >= this.height * this.scale) return null;
        return this.nodes[Math.floor(pos.y / this.scale)][
            Math.floor(pos.x / this.scale)
        ];
    }

    /**
     * Takes two positions and checks if there is a wall between them
     * If there is, returns as far as the player can go
     *
     * @param oldPos The position the player is currently in
     * @param newPos The position the player is trying to move to
     * @returns Position The position the player is capable of moving to
     */
    checkCollision(oldPos: Position, newPos: Position) {
        // TODO: Handle diagonal collisions

        let oldNode = this.getNodeFromPos(oldPos);
        let newNode = this.getNodeFromPos(newPos);
        if (!oldNode || !newNode) {
            
        }
        else if (oldNode.connected.includes(newNode) || oldNode === newNode) {
            return newPos;
        }

        let slope = (newPos.y - oldPos.y) / (newPos.x - oldPos.x);

        let h1 = Math.floor(oldPos.y / this.scale) * this.scale;
        let h2 = Math.ceil(oldPos.y / this.scale) * this.scale;
        let v1 = Math.floor(oldPos.x / this.scale) * this.scale;
        let v2 = Math.ceil(oldPos.x / this.scale) * this.scale;

        let x1 = (h1 - oldPos.y) / slope + oldPos.x;
        let x2 = (h2 - oldPos.y) / slope + oldPos.x;
        let y1 = (v1 - oldPos.x) * slope + oldPos.y;
        let y2 = (v2 - oldPos.x) * slope + oldPos.y;

        if (v1 < x1 && x1 < v2 && newPos.y < h1 && h1 < oldPos.y) {
            return new Position(x1, h1);
        }
        if (v1 < x2 && x2 < v2 && oldPos.y < h2 && h2 < newPos.y) {
            return new Position(x2, h2);
        }
        if (h1 < y1 && y1 < h2 && newPos.x < v1 && v1 < oldPos.x) {
            return new Position(v1, y1);
        }
        if (h1 < y2 && y2 < h2 && oldPos.x < v2 && v2 < newPos.x) {
            return new Position(v2, y2);
        }
    }

    getCondensed(): CondensedMap {
        return {
            width: this.width,
            height: this.height,
            scale: this.scale,
            nodes: this.nodes.map((row) =>
                row.map((node) => node.getCondensed())
            ),
            mapData: this.generateSVG()
        };
    }
}

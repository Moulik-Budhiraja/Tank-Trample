/**
 * Represents a node in a maze
 *
 * @param id The id of the node
 */
class Node {
    id: number;
    neighbours: Node[];
    connected: Node[];
    constructor(id: number) {
        this.id = id;
        this.neighbours = [];
        this.connected = [];
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
    nodes: Node[][];

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
            let row: Node[] = [];
            for (let j = 0; j < this.width; j++) {
                row.push(new Node(i * this.width + j));
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
        let border: Node[] = [];
        let inside: Node[] = [node];

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
            let node: Node;
            while (true) {
                let row = Math.floor(Math.random() * this.height);
                let col = Math.floor(Math.random() * this.width);
                node = this.nodes[row][col];
                if (node.neighbours.length > node.connected.length) {
                    break;
                }
            }
            let neighbour: Node;
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
     * Generates an SVG representation of the map
     *
     * @returns SVG an SVG representation of the map as a string
     */
    generateSVG() {
        let data = '';
        data += `<svg width="${this.width * this.scale}" height="${
            this.height * this.scale
        }">`;
        data += "<path fill='none' stroke='black' stroke-width='2' d='";

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

        data += "' /></svg>";
        return data;
    }
}

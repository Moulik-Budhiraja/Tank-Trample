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

export class Map {
    // Represents the Map as a 2D array of Nodes
    // An edge between two nodes indicates there is no wall between them

    height: number;
    width: number;
    nodes: Node[][];

    constructor(length: number, width: number, openness: number = 0) {
        this.height = length;
        this.width = width;

        this.nodes = [];
        for (let i = 0; i < this.height; i++) {
            let row = [];
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

    generateSVG(scale: number = 100) {
        let data = '';
        data += `<svg width="${this.width * scale}" height="${
            this.height * scale
        }">`;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let node = this.nodes[i][j];
                let x = j * scale;
                let y = i * scale;
                if (!node.connected.includes(this.nodes[i - 1]?.[j])) {
                    data += `<line x1="${x}" y1="${y}" x2="${
                        x + scale
                    }" y2="${y}" stroke="black" stroke-width="2" />`;
                }
                if (!node.connected.includes(this.nodes[i + 1]?.[j])) {
                    data += `<line x1="${x}" y1="${y + scale}" x2="${
                        x + scale
                    }" y2="${y + scale}" stroke="black" stroke-width="2" />`;
                }
                if (!node.connected.includes(this.nodes[i]?.[j - 1])) {
                    data += `<line x1="${x}" y1="${y}" x2="${x}" y2="${
                        y + scale
                    }" stroke="black" stroke-width="2" />`;
                }
                if (!node.connected.includes(this.nodes[i]?.[j + 1])) {
                    data += `<line x1="${x + scale}" y1="${y}" x2="${
                        x + scale
                    }" y2="${y + scale}" stroke="black" stroke-width="2" />`;
                }
            }
        }
        data += '</svg>';
        return data;
    }
}

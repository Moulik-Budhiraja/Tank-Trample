"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maze = exports.MapNode = void 0;
var position_1 = require("./position");
/**
 * Represents a node in a maze
 *
 * @param id The id of the node
 * @param x The x position of the node
 * @param y The y position of the node
 */
var MapNode = /** @class */ (function () {
    function MapNode(id, x, y) {
        this.id = id;
        this.neighbours = [];
        this.connected = [];
        this.position = new position_1.Position(x, y);
    }
    MapNode.prototype.getCondensed = function () {
        var connected = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        for (var _i = 0, _a = this.connected; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.position.x < this.position.x)
                connected.left = true;
            if (node.position.x > this.position.x)
                connected.right = true;
            if (node.position.y < this.position.y)
                connected.up = true;
            if (node.position.y > this.position.y)
                connected.down = true;
        }
        return {
            id: this.id,
            position: this.position.getCondensed(),
            connected: connected
        };
    };
    return MapNode;
}());
exports.MapNode = MapNode;
/**
 * Represents the Map as a 2D array of Nodes
 * An edge between two nodes indicates there is no wall between them
 *
 * @param length The length of the map
 * @param width The width of the map
 * @param scale The scale of the map, side length of one square in pixels
 */
var Maze = /** @class */ (function () {
    function Maze(length, width, scale) {
        if (scale === void 0) { scale = 100; }
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
    Maze.prototype.populateNodes = function () {
        this.nodes = [];
        for (var i = 0; i < this.height; i++) {
            var row = [];
            for (var j = 0; j < this.width; j++) {
                row.push(new MapNode(i * this.width + j, j * this.scale, i * this.scale));
            }
            this.nodes.push(row);
        }
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                var node = this.nodes[i][j];
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
    };
    /**
     * Generates a maze from an empty maze using the randomized Prim's algorithm
     * Creates a minimum spanning tree, meaning all nodes are accessible
     */
    Maze.prototype.generateMaze = function () {
        var node = this.nodes[Math.floor(Math.random() * this.height)][Math.floor(Math.random() * this.width)];
        var border = [];
        var inside = [node];
        for (var _i = 0, _a = node.neighbours; _i < _a.length; _i++) {
            var neighbour = _a[_i];
            border.push(neighbour);
        }
        while (border.length > 0) {
            var index = Math.floor(Math.random() * border.length);
            var node_1 = border[index];
            border.splice(index, 1);
            while (true) {
                var neighbour = node_1.neighbours[Math.floor(Math.random() * node_1.neighbours.length)];
                if (inside.includes(neighbour)) {
                    node_1.connected.push(neighbour);
                    neighbour.connected.push(node_1);
                    inside.push(node_1);
                    break;
                }
            }
            for (var _b = 0, _c = node_1.neighbours; _b < _c.length; _b++) {
                var neighbour = _c[_b];
                if (!inside.includes(neighbour) &&
                    !border.includes(neighbour)) {
                    border.push(neighbour);
                }
            }
        }
    };
    /**
     * Randomly removes walls from the maze based specified openness
     *
     * @param openness A number between 0 to 1, with 0 making no changes and 1 being an empty box
     */
    Maze.prototype.removeWalls = function (openness) {
        var maxEdges = this.height * this.width * 2 - this.height - this.width;
        var edges = this.height * this.width - 1;
        var toAdd = Math.floor((maxEdges - edges) * openness);
        for (var i = 0; i < toAdd; i++) {
            var node = void 0;
            while (true) {
                var row = Math.floor(Math.random() * this.height);
                var col = Math.floor(Math.random() * this.width);
                node = this.nodes[row][col];
                if (node.neighbours.length > node.connected.length) {
                    break;
                }
            }
            var neighbour = void 0;
            while (true) {
                neighbour =
                    node.neighbours[Math.floor(Math.random() * node.neighbours.length)];
                if (!node.connected.includes(neighbour)) {
                    break;
                }
            }
            node.connected.push(neighbour);
            neighbour.connected.push(node);
        }
    };
    /**
     * Generates an SVG representation of the map using paths
     *
     * @returns A string containing path data for the SVG
     */
    Maze.prototype.generateSVG = function () {
        var _a, _b, _c, _d;
        var data = '';
        // draw the border
        data += "M0 0 L".concat(this.width * this.scale, " 0 ");
        data += "L".concat(this.width * this.scale, " ").concat(this.height * this.scale, " ");
        data += "L0 ".concat(this.height * this.scale, " ");
        data += "L0 0 ";
        // use paths to draw the walls
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                var node = this.nodes[i][j];
                if (!node.connected.includes((_a = this.nodes[i - 1]) === null || _a === void 0 ? void 0 : _a[j])) {
                    // draw north wall
                    data += "M".concat(j * this.scale, " ").concat(i * this.scale, " ");
                    data += "L".concat((j + 1) * this.scale, " ").concat(i * this.scale, " ");
                }
                if (!node.connected.includes((_b = this.nodes[i]) === null || _b === void 0 ? void 0 : _b[j - 1])) {
                    // draw west wall
                    data += "M".concat(j * this.scale, " ").concat(i * this.scale, " ");
                    data += "L".concat(j * this.scale, " ").concat((i + 1) * this.scale, " ");
                }
                if (!node.connected.includes((_c = this.nodes[i + 1]) === null || _c === void 0 ? void 0 : _c[j])) {
                    // draw south wall
                    data += "M".concat(j * this.scale, " ").concat((i + 1) * this.scale, " ");
                    data += "L".concat((j + 1) * this.scale, " ").concat((i + 1) * this.scale, " ");
                }
                if (!node.connected.includes((_d = this.nodes[i]) === null || _d === void 0 ? void 0 : _d[j + 1])) {
                    // draw east wall
                    data += "M".concat((j + 1) * this.scale, " ").concat(i * this.scale, " ");
                    data += "L".concat((j + 1) * this.scale, " ").concat((i + 1) * this.scale, " ");
                }
            }
        }
        return data;
    };
    /**
     * Gets a node from an x and y coordinate
     *
     * @param x The x coordinate of the node
     * @param y The y coordinate of the node
     * @returns MapNode The node at the specified coordinates
     */
    Maze.prototype.getNode = function (x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new Error("Invalid node coordinates (x=".concat(x, ", y=").concat(y, ") for map of size (width=").concat(this.width, ", height=").concat(this.height));
        }
        return this.nodes[y][x];
    };
    /**
     * Takes a position and returns the node that position is in
     *
     * @param pos A position on the map
     * @returns MapNode The node that the position is in
     */
    Maze.prototype.getNodeFromPos = function (pos) {
        if (pos.x < 0 || pos.x >= this.width * this.scale)
            return null;
        if (pos.y < 0 || pos.y >= this.height * this.scale)
            return null;
        return this.nodes[Math.floor(pos.y / this.scale)][Math.floor(pos.x / this.scale)];
    };
    Maze.prototype.getCondensed = function () {
        return {
            width: this.width,
            height: this.height,
            scale: this.scale,
            nodes: this.nodes.map(function (row) {
                return row.map(function (node) { return node.getCondensed(); });
            }),
            mapData: this.generateSVG()
        };
    };
    return Maze;
}());
exports.Maze = Maze;

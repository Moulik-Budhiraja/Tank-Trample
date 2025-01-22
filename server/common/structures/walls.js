"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WallManager = void 0;
var WallManager = /** @class */ (function () {
    function WallManager(maze) {
        this.walls = [];
        this.generateWalls(maze);
    }
    WallManager.prototype.generateWalls = function (maze) {
        var _a, _b;
        // Add border walls
        this.walls.push({ x1: 0, y1: 0, x2: maze.width * maze.scale, y2: 0 }, // Top
        { x1: maze.width * maze.scale, y1: 0, x2: maze.width * maze.scale, y2: maze.height * maze.scale }, // Right
        { x1: maze.width * maze.scale, y1: maze.height * maze.scale, x2: 0, y2: maze.height * maze.scale }, // Bottom
        { x1: 0, y1: maze.height * maze.scale, x2: 0, y2: 0 } // Left
        );
        // Add internal walls
        for (var i = 0; i < maze.height; i++) {
            for (var j = 0; j < maze.width; j++) {
                var node = maze.nodes[i][j];
                // Check north wall
                if (!node.connected.includes((_a = maze.nodes[i - 1]) === null || _a === void 0 ? void 0 : _a[j])) {
                    this.walls.push({
                        x1: j * maze.scale,
                        y1: i * maze.scale,
                        x2: (j + 1) * maze.scale,
                        y2: i * maze.scale
                    });
                }
                // Check west wall
                if (!node.connected.includes((_b = maze.nodes[i]) === null || _b === void 0 ? void 0 : _b[j - 1])) {
                    this.walls.push({
                        x1: j * maze.scale,
                        y1: i * maze.scale,
                        x2: j * maze.scale,
                        y2: (i + 1) * maze.scale
                    });
                }
            }
        }
    };
    /**
     * Checks if a line segment intersects with any wall
     * @param start Start position of the line segment
     * @param end End position of the line segment
     * @returns true if there's an intersection, false otherwise
     */
    WallManager.prototype.checkLineCollision = function (start, end) {
        for (var _i = 0, _a = this.walls; _i < _a.length; _i++) {
            var wall = _a[_i];
            if (this.lineIntersects(start.x, start.y, end.x, end.y, wall.x1, wall.y1, wall.x2, wall.y2)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Checks if two line segments intersect
     * Uses the line-line intersection algorithm
     */
    WallManager.prototype.lineIntersects = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        // Calculate denominators
        var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0)
            return false; // Lines are parallel
        var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    };
    /**
     * Gets the four corners of a player given their position, dimensions, and rotation
     */
    /**
     * Gets all walls for debugging or rendering purposes
     */
    WallManager.prototype.getWalls = function () {
        return __spreadArray([], this.walls, true);
    };
    return WallManager;
}());
exports.WallManager = WallManager;

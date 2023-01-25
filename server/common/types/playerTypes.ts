import { CondensedPosition } from './positionTypes';

/**
 * Represents a condensed version of a player with
 * only the necessary information
 */
export type CondensedPlayer = {
    id: string;
    name: string;
    gameCode: string;
    host: boolean;
    position: CondensedPosition;
    bodyAngle: number;
    turretAngle: number;
    width: number;
    height: number;
    alive: boolean;
    score: number;
};

import { Map } from '../structures/map';
import { Projectile } from '../structures/projectiles';
import { CondensedPlayer } from './playerTypes';
import { CondensedPosition } from './positionTypes';

/**
 * Represents the game code that the player is trying to join
 */
export type GameValidation = {
    gameCode: string;
    valid: boolean;
};

export type CondensedRound = {
    gameCode: string;
    roundNumber: number;
    projectiles: Projectile[];
    players: CondensedPlayer[];
    map: string;
};

export type MoveEvent = {
    type: 'move';
    position: CondensedPosition;
    bodyAngle: number;
    turretAngle: number;
};

export type ShootEvent = {
    type: 'shoot';
    position: CondensedPosition;
    turretAngle: number;
    bodyAngle: number;
};

export type GameEvent = MoveEvent | ShootEvent;

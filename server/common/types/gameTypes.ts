import { Maze } from '../structures/map';
import { Projectile } from '../structures/projectiles';
import { CondensedMap } from './mapTypes';
import { CondensedPlayer } from './playerTypes';
import { CondensedPosition } from './positionTypes';
import { CondensedPowerUp, CondensedProjectile } from './projectileTypes';

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
    projectiles: CondensedProjectile[];
    players: CondensedPlayer[];
    powerups: CondensedPowerUp[];
    map: CondensedMap | null;
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

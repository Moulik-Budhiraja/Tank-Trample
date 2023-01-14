import { Map } from '../structures/map';
import { Projectile } from '../structures/projectiles';
import { CondensedPlayer } from './playerTypes';

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
    map: Map;
};

import {
    AirBurst,
    LandMine,
    Laser,
    Projectile,
    Rocket
} from '../structures/projectiles';
import { CondensedPosition } from './positionTypes';

export type CondensedProjectile = {
    id: string;
    playerId: string;
    timeCreated: number;
    lifeTime: number;
    width: number;
    height: number;
    pos: {
        x: number;
        y: number;
    };
    vel: {
        x: number;
        y: number;
    };
};

export type ProjectileType =
    | 'BULLET'
    | 'ROCKET'
    | 'AIRBURST'
    | 'LASER'
    | 'MINE';

export type ProjectileTypes = Projectile | AirBurst | Rocket | LandMine | Laser;

export type CondensedPowerUp = {
    id: string;
    position: CondensedPosition;
    letter: string;
};

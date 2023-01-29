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

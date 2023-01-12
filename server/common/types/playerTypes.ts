/**
 * Represents the name that the player is setting
 * to themselves
 */
export type Name = {
    name: string;
};

/**
 * Represents a condensed version of a player with
 * only the necessary information
 */
export type CondensedPlayer = {
    id: string;
    name: string;
    gameCode: string;
};

export type CondensedPlayerList = {
    players: CondensedPlayer[];
};

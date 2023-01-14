/**
 * Represents a condensed version of a player with
 * only the necessary information
 */
export type CondensedPlayer = {
    id: string;
    name: string;
    gameCode: string;
    host: boolean;
};

export type CondensedPlayerList = {
    players: CondensedPlayer[];
};

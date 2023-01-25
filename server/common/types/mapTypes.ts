import { CondensedPosition } from './positionTypes';

export type CondensedMapNode = {
    id: number;
    position: CondensedPosition;
    connected: {
        left: boolean;
        right: boolean;
        up: boolean;
        down: boolean;
    };
};

export type CondensedMap = {
    width: number;
    height: number;
    scale: number;
    nodes: CondensedMapNode[][];
    mapData: string;
};

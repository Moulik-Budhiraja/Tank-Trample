export interface Player {
  name: string;
  id: string;
  gameCode: string;
}

export type PlayerList = {
  players: Player[];
};

export type Name = {
  name: string;
};
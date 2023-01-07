import { Player } from '../types/playerTypes';

type genericPlayerListProps = {
  players: Player[];
};

export function GenericPlayerList({ players }: genericPlayerListProps) {
  return (
    <>
      <div>
        {players.map((player) => {
          return (
            <div key={player.id}>
              <p>{player.name}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

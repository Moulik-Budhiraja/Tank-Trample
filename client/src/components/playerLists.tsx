import { Player } from '../types/playerTypes';

type genericPlayerListProps = {
  players: Player[];
};

/**
 * Renders a list of players.
 * 
 * @param players A list of players
 */
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

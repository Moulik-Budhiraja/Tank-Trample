import { CondensedPlayer } from '../../../server/common/types/playerTypes';

type genericPlayerListProps = {
  players: CondensedPlayer[];
};

/**
 * Renders a list of players.
 *
 * @param players A list of players
 */
export function GenericPlayerList({ players }: genericPlayerListProps) {
  return (
    <>
      <div
        style={{
          textAlign: 'left',
          minWidth: '200px',
          maxWidth: '300px',
          overflow: 'scroll'
        }}
      >
        <h3 style={{ textAlign: 'center' }}>Players</h3>
        <ul
          style={{
            listStyleType: 'none',
            maxHeight: '50vh',
            overflowY: 'scroll'
          }}
        >
          {players.map((player) => {
            return (
              <li
                key={player.id}
                style={{
                  maxWidth: '10rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {player.name}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

// http://localhost:3000/lobby/?gameCode=USHKYD

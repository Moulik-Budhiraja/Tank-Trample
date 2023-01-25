import { CondensedPlayer } from '../../../server/common/types/playerTypes';

export function ScoreBoard(props: { players: CondensedPlayer[] }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '50%',
          right: '8rem',
          transform: 'translateY(-50%)'
        }}
      >
        <h3>Score</h3>
        <ul
          style={{
            listStyleType: 'none',
            padding: '0'
          }}
        >
          {props.players.map((player) => {
            return (
              <li key={player.id}>
                {player.name}: {player.score}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

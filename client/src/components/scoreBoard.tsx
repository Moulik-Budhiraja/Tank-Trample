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
          {props.players
            .sort((a, b) => {
              return b.score - a.score;
            })
            .map((player) => {
              return (
                <li
                  key={player.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span
                    style={{
                      maxWidth: '7rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'inline-block'
                    }}
                  >
                    {player.name}
                  </span>
                  <span>: {player.score}</span>
                </li>
              );
            })}
        </ul>
      </div>
    </>
  );
}

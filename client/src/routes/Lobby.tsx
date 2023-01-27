import { socket } from '../service/socket';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GameValidation } from '../../../server/common/types/gameTypes';
import { GenericPlayerList } from '../components/playerLists';
import { CondensedPlayer } from '../../../server/common/types/playerTypes';
import { PingTracker } from '../components/pingTracker';

/**
 * Renders the Lobby page.
 */
export function Lobby() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState(String);
  const [gameCode, setGameCode] = useState(String);
  const [gameCodeError, setGameCodeError] = useState(false);

  const [players, setPlayers] = useState([] as CondensedPlayer[]);

  const [myName, setMyName] = useState(String);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    setGameCode(searchParams.get('gameCode') || '');

    socket.emit('validate-game-code', {
      gameCode: searchParams.get('gameCode')
    });

    socket.on('game-code-valid', (data: GameValidation) => {
      if (!data.valid) {
        setGameCodeError(true);

        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        socket.emit('join-game', {
          gameCode: searchParams.get('gameCode')
        });
      }
    });

    socket.on('player-list', (data: { players: CondensedPlayer[] }) => {
      setPlayers(data.players);
    });

    socket.on('player-update', (data: CondensedPlayer) => {
      setMyName(data.name);
      setIsHost(data.host);
    });

    socket.on('game-started', () => {
      navigate('/play');
    });
  }, [searchParams.get(gameCode)]);

  function updateInputName(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.value.length > 32) {
      event.currentTarget.value = event.currentTarget.value.slice(0, 32);
      return;
    }
    setName(event.currentTarget.value);
  }

  function updateName(
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    if (
      event.type === 'keydown' &&
      (event as React.KeyboardEvent).key !== 'Enter'
    ) {
      return;
    }

    socket.emit('set-name', { name: name });
    let input: HTMLInputElement = document.getElementById(
      'setName'
    ) as HTMLInputElement;
    input!.value = '';
  }

  function startGame() {
    if (isHost) {
      socket.emit('start-game');
    }
  }

  return (
    <>
      <h1
        style={{
          textAlign: 'center',
          fontFamily: 'permanent marker',
          fontSize: 'clamp(2rem, 10vw, 5rem)',
          whiteSpace: 'nowrap',
          color: 'red'
        }}
      >
        Lobby
      </h1>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            height: '50vh'
          }}
        >
          <div>
            <p>Game Code: {gameCode}</p>
            <p>Current Name: {myName}</p>
            <span className="join-lobby input-group" style={{ width: '70%' }}>
              <input
                id="setName"
                onChange={updateInputName}
                onKeyDown={updateName}
                type="text"
                placeholder="Set Name"
                className="form-control"
                style={{
                  width: '100%'
                }}
              />
              <button onClick={updateName} className="btn btn-success">
                Update
              </button>
            </span>
            {gameCodeError && (
              <p style={{ color: 'red' }}>
                Game code is invalid. Redirecting to home page...
              </p>
            )}
          </div>
          <div
            style={{
              position: 'relative',
              bottom: '3rem'
            }}
          >
            <GenericPlayerList players={players}></GenericPlayerList>
          </div>
        </div>
        {isHost && (
          <button onClick={startGame} className="btn btn-primary">
            Start Game
          </button>
        )}

        <br />
        <PingTracker></PingTracker>
      </div>
    </>
  );
}

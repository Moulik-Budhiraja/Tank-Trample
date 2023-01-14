import { socket } from '../service/socket';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GameValidation } from '../../../server/common/types/gameTypes';
import { InvalidGameCode } from '../components/errorMessages';
import { GenericPlayerList } from '../components/playerLists';
import { CondensedPlayer, CondensedPlayerList } from '../../../server/common/types/playerTypes';
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

    socket.on('player-list', (data: CondensedPlayerList) => {
      setPlayers(data.players);
    });

    socket.on('player-update', (data: CondensedPlayer) => {
      setMyName(data.name);
      setIsHost(data.host);
    })

    socket.on('game-started', () => {
      navigate('/play');
    })

  }, [searchParams.get(gameCode)]);

  function updateInputName(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.currentTarget.value);
  }

  function updateName(event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key !== 'Enter')) {
      return;
    }

    socket.emit('set-name', { name: name });
    let input: HTMLInputElement = document.getElementById('setName') as HTMLInputElement;
    input!.value = '';

  }

  function startGame() {
    if (isHost) {
      socket.emit('start-game');
    }
  }

  return (
    <>
      <h1 style={{textAlign: 'center'}}>Lobby</h1>

      <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            height: '60vh'
          }}
        >
          <div>
            <p>Game Code: {gameCode}</p>
            <p>Current Name: {myName}</p>
            <input
              id='setName'
              onChange={updateInputName}
              onKeyDown={updateName}
              type="text"
              placeholder="Set Name"
            />
            <button onClick={updateName}>Update</button>
            <InvalidGameCode gameCodeError={gameCodeError}></InvalidGameCode>
          </div>
          <GenericPlayerList players={players}></GenericPlayerList>
        </div>
        { isHost && <button onClick={startGame} >Start Game</button>}
        
      <br />
      <PingTracker></PingTracker>
      </div>
    </>
  );
}

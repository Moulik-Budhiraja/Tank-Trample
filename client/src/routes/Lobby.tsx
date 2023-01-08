import { socket } from '../service/socket';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GameValidation } from '../types/gameTypes';
import { InvalidGameCode } from '../components/errorMessages';
import { Player, PlayerList } from '../types/playerTypes';
import { GenericPlayerList } from '../components/playerLists';

/**
 * Renders the Lobby page.
 */
export function Lobby() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState(String);
  const [gameCode, setGameCode] = useState(String);
  const [gameCodeError, setGameCodeError] = useState(false);

  const [players, setPlayers] = useState([] as Player[]);

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

    socket.on('player-list', (data: PlayerList) => {
      setPlayers(data.players);
      console.log(data.players);
    });
  });

  function updateInputName(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.currentTarget.value);
  }

  function updateName() {
    socket.emit('set-name', { name: name });
  }

  return (
    <>
      <h1>Lobby</h1>
      <p>Game Code: {gameCode}</p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <input
            onChange={updateInputName}
            type="text"
            placeholder="Set Name"
          />
          <button onClick={updateName}>Update</button>
          <InvalidGameCode gameCodeError={gameCodeError}></InvalidGameCode>
        </div>
        <GenericPlayerList players={players}></GenericPlayerList>
      </div>
    </>
  );
}

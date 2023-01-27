import { time } from 'console';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../service/socket';
import styled from 'styled-components';
import { GameValidation } from '../../../server/common/types/gameTypes';
import { Tank } from '../components/tank';
import { Bullet } from '../components/bullet';

/**
 * Renders the Home page.
 */
export function Home() {
  const [gameCode, setGameCode] = useState(String);
  const [gameCodeError, setGameCodeError] = useState(false);

  const navigate = useNavigate();

  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.currentTarget.value = event.currentTarget.value.toUpperCase();

    setGameCode(event.currentTarget.value);
  }

  function joinLobby(
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

    socket.emit('validate-game-code', { gameCode: gameCode });

    socket.on('game-code-valid', (data: GameValidation) => {
      console.log(data);

      if (data.valid) {
        navigate(`/lobby/?gameCode=${data.gameCode}`);
      } else {
        setGameCodeError(true);
      }
    });
  }

  function createLobby() {
    socket.emit('create-game');
    socket.on('game-created', (data: GameValidation) => {
      navigate(`/lobby/?gameCode=${data.gameCode}`);
    });
  }

  return (
    <>
      <h1
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'permanent marker',
          fontSize: 'clamp(2rem, 10vw, 5rem)',
          whiteSpace: 'nowrap',
          color: 'red'
        }}
      >
        Tank Trample
      </h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          height: '95vh'
        }}
      >
        <p
          style={{
            textAlign: 'center',
            maxWidth: '15rem',
            margin: '0'
          }}
        >
          Enter Code or Create New Lobby
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            width: 'clamp(17rem, 30%, 20rem)'
          }}
        >
          <span className="join-lobby input-group" style={{ width: '100%' }}>
            <input
              onChange={handleCodeChange}
              onKeyDown={joinLobby}
              type="text"
              placeholder="Game Code"
              className="form-control"
              style={{
                width: '100%'
              }}
            />
            <button onClick={joinLobby} className={'btn btn-success'}>
              Join Lobby
            </button>
          </span>
          <button
            style={{
              width: '10rem'
            }}
            onClick={createLobby}
            className={'btn btn-primary'}
          >
            Create New Lobby
          </button>
        </div>
        {gameCodeError && (
          <p
            style={{
              color: 'red'
            }}
          >
            Invalid Game Code
          </p>
        )}
      </div>

      <Tank
        name={''}
        width={200}
        height={200}
        pos={{ x: 60, y: 60 }}
        bodyRotation={145}
        turretRotation={110}
      ></Tank>
    </>
  );
}

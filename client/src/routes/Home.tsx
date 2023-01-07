import { time } from 'console';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../service/socket';
import styled from 'styled-components';
import { GameValidation } from '../types/gameTypes';
import { InvalidGameCode } from '../components/errorMessages';

export function Home() {
  const [gameCode, setGameCode] = useState(String);
  const [gameCodeError, setGameCodeError] = useState(false);

  const navigate = useNavigate();

  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.currentTarget.value = event.currentTarget.value.toUpperCase();

    setGameCode(event.currentTarget.value);
  }

  function joinLobby() {
    socket.emit('validate-game-code', { gameCode: gameCode });

    socket.on('game-code-valid', (data: GameValidation) => {
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
      <h1>Tank Trample</h1>
      <p>Welcome to Tank Trample!</p>
      <input onChange={handleCodeChange} type="text" placeholder="Game Code" />
      <button onClick={joinLobby}>Join Lobby</button>
      <InvalidGameCode gameCodeError={gameCodeError}></InvalidGameCode>
      <br />
      <br />
      <button onClick={createLobby}>Create New Lobby</button>
    </>
  );
}

import React from 'react';
import './App.css';
import io from 'socket.io-client';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './Home';
import { Lobby } from './Lobby';
import { Play } from './Play';

const socket = io('http://localhost:3001'); // TODO - make this dynamic

function App() {
  return (
    <Routes>
      <Route path="/" element={ <Home socket={socket} /> } />
      <Route path="/lobby" element={<Lobby socket={socket} /> } />
      <Route path="/play" element={<Play socket={socket} /> } />
      <Route path='*' element={<Navigate to="/" /> } />
    </Routes>
  );
}

export default App;

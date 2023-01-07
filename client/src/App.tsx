import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './routes/Home';
import { Lobby } from './routes/Lobby';
import { Play } from './routes/Play';

function App() {
  useEffect(() => {
    document.title = 'Tank Trample';
  });

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/play" element={<Play />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

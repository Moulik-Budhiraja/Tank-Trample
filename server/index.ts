import { Socket } from 'socket.io';
import { Game } from './common/structures/game';
import { Player } from './common/structures/player';

const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Sets up CORS and socket.io
// just trust me bro
app.use(cors());

const server = http.createServer(app);

let local = false;

process.argv.forEach((arg) => {
    if (arg === 'local') {
        local = true;
    }
});

const io = new Server(server, {
    cors: {
        origin: local
            ? 'http://localhost:3000'
            : 'https://tank-trample.budhiraja.ca',
        methods: ['GET', 'POST']
    }
});

// Pass the socket.io instance to the game class
Game.io = io;

// Sets up listeners for all game events
io.on('connection', (socket: Socket) => {
    let player = new Player(socket);

    player.initializeEvents();
    Game.initializePlayerEvents(player);

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
        player.handleDisconnect();
    });
});

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});

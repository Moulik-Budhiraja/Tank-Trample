const express = require('express');
const app = express(); 
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

app.use(cors());


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // TODO change to specific in prod
        methods: ['GET', 'POST']
    }
});


server.listen(3058, () => {
    console.log('Server is running on port 3058')
});
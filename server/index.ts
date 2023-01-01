import { Socket } from "socket.io";

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // TODO change to specific in prod
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket: Socket) => {
    console.log(`user connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`user disconnected: ${socket.id}`);
    });
});

server.listen(3001, () => {
    console.log("Server is running on port 3001");
});

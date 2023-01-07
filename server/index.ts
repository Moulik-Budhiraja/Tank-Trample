import { Socket } from "socket.io";
import { Game } from "./components/game";
import { Player } from "./components/player";

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // TODO change to tank-trample.budhiraja.ca in prod
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket: Socket) => {
    let player = new Player(socket);

    player.initializeEvents();

    socket.emit("connected", { id: socket.id });

    socket.on("ping", () => {
        socket.emit("pong");
    });

    socket.on("disconnect", () => {
        console.log(`user disconnected: ${socket.id}`);
    });
});

server.listen(3001, () => {
    console.log("Server is running on port 3001");
});

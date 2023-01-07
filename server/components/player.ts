import { Socket } from "socket.io";

type Name = {
    name: String;
};

export class Player {
    socket: Socket;
    name: String = "";

    constructor(socket: Socket) {
        this.socket = socket;
    }

    initializeEvents() {
        this.socket.on("set-name", (data: Name) => {
            this.name = data.name;
        });
    }
}

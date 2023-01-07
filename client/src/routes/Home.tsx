import { time } from 'console';
import { useEffect, useState } from 'react'
import { socket } from '../service/socket'

type connectionConfirmation = {
    id: number
}

export function Home() {
    const [socketId, setSocketId] = useState(Number);
    const [ping, setPing] = useState(Number);



    useEffect(() => {
        let connectionTime: number = 0;

        // When connected to the server
        socket.on("connected", (data: connectionConfirmation) => {
            setSocketId(data.id);


            setInterval(() => {
                connectionTime = Date.now();
    
                // Send a ping
                socket.emit("ping");
    
                // Record the time delta of the pong
                socket.on("pong", () => {
                    setPing(Date.now() - connectionTime);
                });
            }, 1000);

        });
        

    });

    return (
        <>
        <h1>Home</h1>
            <p>This is the home page</p>
            <p>Connected to server with socket id: {socketId} </p>
            <p>Ping: { ping }</p>
        </>
    )
}
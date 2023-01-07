import { socket } from "../service/socket"
import {  useState } from 'react'


export function Lobby() {
    const [name, setName] = useState(String);

    function updateInputName(event: React.ChangeEvent<HTMLInputElement>) {
        setName(event.currentTarget.value);
    }

    function updateName() {
        socket.emit("set-name", {name: name});
    }

    return (
        <>
        <h1>Lobby</h1>
            <p>This is the lobby page</p>
            <input onChange={updateInputName} type="text" placeholder="Set Name" />
            <button onClick={updateName}>Update</button>
        </>
    )
}
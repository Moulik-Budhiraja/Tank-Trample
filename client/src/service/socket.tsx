import io from "socket.io-client";
import { DEV_SOCKET_URL, SOCKET_URL } from "../config";

console.log("Socket URL: ", window.location.origin === "https://tank-trample.budhiraja.ca" ? SOCKET_URL : DEV_SOCKET_URL)
export const socket = io(SOCKET_URL);


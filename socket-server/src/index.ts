import { Server } from "socket.io";
import { drawingHandler } from "./socket/drawing.js";
import type { Room, Stroke } from "./types/index.js";
import { roomHandler} from "./socket/room.js";
import { chatHandler } from "./socket/chat.js";
import { gameHandler } from "./socket/game.js";
import { lobbyHandler } from "./socket/lobby.js";


const io = new Server(3001, {
    cors: {
        origin: "http://localhost:3000"
    }
});

const rooms = new Map<
    string,
    Room
>();

io.on("connection", (socket) => {

    console.log("Connected:", socket.id);
    drawingHandler(io, socket, rooms);
    roomHandler(io , socket , rooms)
    chatHandler(io, socket, rooms);
    gameHandler(io, socket, rooms);
    lobbyHandler(io , socket , rooms);


    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
    });

});


console.log(
    "socket running on 3001"
);


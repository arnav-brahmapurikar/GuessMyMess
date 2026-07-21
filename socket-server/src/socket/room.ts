import type { Socket } from "socket.io"
import type { Server } from "socket.io"
import type { DefaultEventsMap } from "socket.io"
import type { Room, Stroke } from "../types/index.js"
import { getPublicRoom, handlePlayerLeave } from "./game.js"

export function roomHandler(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket,
    rooms: Map<
        string, Room
    >
) {

    socket.on("room:create", (rounds, timer, name) => {
        let code: string = "ABCDE"
        do {
            code = generateUppercaseAlphanumeric(5)
        } while (rooms.has(code))
        const room: Room = {
            id : code,
    gameState : "lobby",
    hostId: socket.id,
    undoStrokes: [],
    timer,
    strokes: [],
    roundStart: 0,
    players: [{
        id: socket.id,
        name,
        points: 0,
        hasDrawn: false,
        hasGuessed: false,
        pointsThisTurn : 0
    }],
    maxRounds: rounds,
    currentRound: 0,
    correctWord: "",
};

rooms.set(code, room);
socket.join(code)
socket.data.roomId = code

socket.emit(
    "room:state",
    getPublicRoom(room)
);
    })

    socket.on("room:join", (roomId, name) => {
        const room = rooms.get(roomId);
        if (!room) {
            socket.emit("join:failed");
            return;
        }
            
        if (!room.players.some(p => p.id === socket.id)) {
            socket.join(roomId);
            const player = {
                id: socket.id,
                name,
                points: 0,
                hasDrawn: false,
                hasGuessed: false,
                pointsThisTurn: 0,
            };

            socket.data.roomId = roomId;
            room.players.push(player);
            
            io.to(roomId).emit("system:message", {
                type: "player_joined",
                message: `${name} joined the room`
            });
        }
        
        // 1. Send the general room state to EVERYONE
        io.to(roomId).emit("room:state", getPublicRoom(room));
        
        // 2. Send the exact canvas strokes ONLY to the newcomer!
        socket.emit("canvas:state", {
            strokes: room.strokes,
            undoStrokes: room.undoStrokes
        });
    });

    socket.on("disconnect", () => {
        const roomId = socket.data.roomId
        if(!roomId)return;

        handlePlayerLeave(io , socket ,rooms, roomId)
    });
    
   

}

function generateUppercaseAlphanumeric(length: number = 5): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}


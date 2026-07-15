import type { Socket } from "socket.io"
import type { Server } from "socket.io"
import type { DefaultEventsMap } from "socket.io"
import type { Room, Stroke } from "../types/index.js"

export function lobbyHandler(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket,
    rooms: Map<
        string, Room
    >
) {

    socket.on("lobby:update-rounds", (roomId , rounds) => {
        const room = rooms.get(roomId);
        if (!room) return;
        if (room.hostId !== socket.id) return;
        room.maxRounds = rounds
        io.to(roomId).emit("room:state" ,room)
    })
    socket.on("lobby:update-timer", (roomId, timer) => {
        const room = rooms.get(roomId);
        if (!room) return;
        if (room.hostId !== socket.id) return;
        room.timer = timer
        io.to(roomId).emit("room:state" ,room)
    })
    socket.on("lobby:kick", (roomId, pid) => {
        const room = rooms.get(roomId);
        if (!room) return;
        if (room.hostId !== socket.id) return;
        const player = room.players.find(r => r.id === pid)
        if(!player )return ;
        if (pid === room.hostId)
        return;
        room.players = room.players.filter(r => r.id !== pid)
        const kickedSocket = io.sockets.sockets.get(pid);
        if (kickedSocket) {
            kickedSocket.leave(roomId);
            kickedSocket.data.roomId = undefined;
            kickedSocket.emit("lobby:kicked");
        }
        io.to(roomId).emit("room:state" , room)

        io.to(roomId).emit(
        "system:message",
        {
            type: "player_kicked",
            message: `${player.name} got kicked out of the room`
        }
        );
    })
    // socket.on("lobby:change-name", (roomId) => {
    //     const room = rooms.get(roomId);
    //     if (!room) return;
    //     if (room.hostId !== socket.id) return;
    // })
    // socket.on("lobby:toggle-private", (roomId) => {
    //     const room = rooms.get(roomId);
    //     if (!room) return;
    //     if (room.hostId !== socket.id) return;
    // })

}
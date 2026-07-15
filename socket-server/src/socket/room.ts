import type { Socket } from "socket.io"
import type { Server } from "socket.io"
import type { DefaultEventsMap } from "socket.io"
import type { Room, Stroke } from "../types/index.js"

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
        hasGuessed: false
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
    room
);
    })

    socket.on(
        "room:join",
        (roomId, name) => {

            
            const room = rooms.get(roomId)
            if (!room) {
                socket.emit("join:failed");
                return;
            }
            
            if (room.players.some(p => p.id === socket.id)) {
                
            }
            else {
                socket.join(roomId);
                const player = {
                    id: socket.id,
                    name,
                    points: 0,
                    hasDrawn: false,
                    hasGuessed: false
                };

                socket.data.roomId = roomId
                room.players.push(player);
                io.to(roomId).emit(
                    "system:message",
                    {
                        type: "player_joined",
                        message: `${name} joined the room`
                    }
                )
            }
            io.to(roomId).emit("room:state", room)
            
            


            
            
            // saved for later (when public room )
            // socket.emit(
            //     "canvas:state",
            //     rooms.get(roomId) ?? {}
            // );



        });

    socket.on("disconnect", () => {

    const roomId = socket.data.roomId;

    if (!roomId) return;

    const room = rooms.get(roomId);

    if (!room) return;

    const leavingPlayer = room.players.find(
        p => p.id === socket.id
    );

    if (!leavingPlayer) return;

    room.players = room.players.filter(
        p => p.id !== socket.id
    );

    // Delete empty room
    if (room.players.length === 0) {
        rooms.delete(roomId);
        return;
    }

    
    // Notify everyone that the player left
    io.to(roomId).emit(
        "system:message",
        {
            type: "player_left",
            message: `${leavingPlayer.name} left the game`
        }
    );
    
    // Transfer host if necessary
    if (room.hostId === socket.id) {
        
        const newHost = room.players[0]!;
        
        room.hostId = newHost.id;
        
        io.to(roomId).emit(
            "system:message",
            {
                type: "host_changed",
                message: `${newHost.name} is the new host`
            }
        );
    }
    
    
    io.to(roomId).emit(
        "room:state",
        room
    );
    // Synchronize room state

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

import type { Server, Socket } from "socket.io";
import type { DefaultEventsMap } from "socket.io";
import type { Room } from "../types/index.js";

// ==========================================
// CORE GAME LOOP HELPERS
// ==========================================

const wordPool = ["apple", "elephant", "guitar", "mountain", "ocean", "pizza", "astronaut", "castle"];

export function startDrawingPhase(
    io: Server, 
    rooms: Map<string, Room>, 
    roomId: string, 
    word: string
) {
    const room = rooms.get(roomId);
    if (!room) return;

    // 1. Kill the 15-second choosing timer
    if (room.activeTimer) clearTimeout(room.activeTimer);

    // 2. Set strict drawing state
    room.correctWord = word;
    room.gameState = "drawing";
    room.roundStart = Date.now();

    const drawer = room.players.find(p => !p.hasDrawn);

    // 3. DTO Pattern: Mask the word for the public payload
    const maskedWord = word.replace(/[a-zA-Z]/g, "_ ");
    const publicRoomState = { ...room, correctWord: maskedWord };

    // 4. Broadcast state securely
    io.to(roomId).emit("room:state", publicRoomState);
    if (drawer) {
        io.to(drawer.id).emit("game:you-are-drawing", word);
    }

    // 5. Start the main Drawing Timer (e.g., 80 seconds)
    const roundDurationMs = (room.timer) * 1000;
    
    room.activeTimer = setTimeout(() => {
        // --- TIME IS UP ---
        if (drawer) drawer.hasDrawn = true;
        room.gameState = "results";

        io.to(roomId).emit("room:state")

        // Wait 5 seconds on the results screen, then start the next turn
        room.activeTimer = setTimeout(() => {
            startNextTurn(io, rooms, roomId);
        }, 5000);

    }, roundDurationMs);
}

export function startNextTurn(
    io: Server, 
    rooms: Map<string, Room>, 
    roomId: string
) {
    const room = rooms.get(roomId);
    if (!room) return;

    // 1. Find who is drawing next
    let drawer = room.players.find(p => p.hasDrawn === false);
    
    room.players.forEach( p => {p.points += p.pointsThisTurn; p.pointsThisTurn = 0 ;})

    // 2. If everyone has drawn, increment round
    if (!drawer) {
        startNextRound(io , rooms , roomId);
        return;
    }

    // 3. Reset everyone's guessing status for this turn
    room.players.forEach(p => p.hasGuessed = false);

    // --- PHASE 1: Seperate message for drawer and non-drawers ---
    room.gameState = "choosing"
    io.to(roomId).emit("room:state", room);
    const shuffledPool = wordPool.sort(() => 0.5 - Math.random());
    const selectedChoices = shuffledPool.slice(0, 3);
    io.to(roomId).emit("system:message", {
        type: "info",
        message: `${drawer.name} is choosing a word...`
    });
    if (room.activeTimer) clearTimeout(room.activeTimer);
    const drawerSocket = io.sockets.sockets.get(drawer.id);
    if (drawerSocket) {
        drawerSocket.emit("game:choose-word", selectedChoices)
        room.activeTimer = setTimeout(()=> {
            room.gameState = "drawing"
            const forcedWord = selectedChoices[Math.floor(Math.random()*3)];
            startDrawingPhase(io, rooms, roomId, forcedWord!);
        },10000)
    }

}

export function startNextRound(
    io: Server, 
    rooms: Map<string, Room>, 
    roomId: string
) {
    const room = rooms.get(roomId);
    if (!room) return;

    // 1. Find who is drawing next
   
        room.currentRound = (room.currentRound ) + 1;
        
        // Check if the game is completely over
        if (room.currentRound > (room.maxRounds )) {
            room.gameState = "results"; // Or a dedicated "game-over" state
            io.to(roomId).emit("room:state", room);
            io.to(roomId).emit("system:message", { type: "info", message: "Game Over! Thanks for playing." });
            return;
        }

        // Reset draw status for the new round
    room.players.forEach(p => {p.hasDrawn = false });
    
    room.gameState = "round-start"
    io.to(roomId).emit("room:state" , room)
    room.activeTimer = setTimeout(() => {
        startNextTurn(io , rooms , roomId)
    }, 5000);
}

// ==========================================
// SOCKET HANDLER ATTACHMENT
// ==========================================

export function gameHandler(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket,
    rooms: Map<string, Room>
) {
    
    // 1. The initial trigger from the Lobby Host
    socket.on("game:start", (roomId) => {
        const room = rooms.get(roomId);
        if (!room) return;
        if (room.hostId !== socket.id) return; // Only host can start the game
        
        room.currentRound = 0;
        startNextRound(io, rooms, roomId);
    });

    // 2. The manual choice from the Drawer
    socket.on("game:word-selected", (roomId, word) => {
        const room = rooms.get(roomId);
        if (!room) return;
        
        // Ensure they can't force a word selection if it's not the choosing phase
        if (room.gameState !== "choosing") return;
        startDrawingPhase(io, rooms, roomId, word);
    });

    // 3. The Chat & Guessing Engine
    socket.on("chat:send", (roomId, message) => {
        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        const isDrawingPhase = room.gameState === "drawing";
        const guess = message.trim().toLowerCase();
        const actualWord = room.correctWord?.toLowerCase() || "";

        if (isDrawingPhase) {
            // 1. SECRET CHAT: If they already guessed it, only other guessers see it
            if (player.hasGuessed) {
                const guessedPlayers = room.players.filter(p => p.hasGuessed);
                
                // Send as a special chat message so the frontend can style it uniquely
                guessedPlayers.forEach(p => {
                    io.to(p.id).emit("chat:message", {
                        id: Math.random().toString(36).substring(7),
                        type: "secret", 
                        text: message,
                        sender: player.name
                    });
                });
                return; // STOP EXECUTION HERE
            }
            
            // 2. CORRECT GUESS
            else if (guess === actualWord) {
                const currentDrawer = room.players.find(p => !p.hasDrawn);
                if (currentDrawer && currentDrawer.id === socket.id) return; // Drawer can't guess

                player.hasGuessed = true;

                // Apply points logic
                const timeElapsed = Date.now() - room.roundStart!;
                const roundDurationMs = room.timer * 1000;
                const timeLeftRatio = Math.max(0, roundDurationMs - timeElapsed) / roundDurationMs;

                player.pointsThisTurn = Math.floor((timeLeftRatio * 450) + 50);
                if (currentDrawer) {
                    currentDrawer.pointsThisTurn = (currentDrawer.pointsThisTurn || 0) + 50;
                }
                
                io.to(roomId).emit("system:message", {
                    type: "success",
                    message: `✅ ${player.name} guessed the word!`
                });

                // Check if EVERYONE (except drawer) has guessed it
                const allGuessed = room.players.every(p => 
                    p.hasGuessed || (currentDrawer && p.id === currentDrawer.id)
                );
                
                if (allGuessed) {
                    if (room.activeTimer) clearTimeout(room.activeTimer);
                    if (currentDrawer) currentDrawer.hasDrawn = true;
                    
                    room.gameState = "results";
                    io.to(roomId).emit("room:state", room);

                    room.activeTimer = setTimeout(() => {
                        startNextTurn(io, rooms, roomId);
                    }, 5000);
                }
                return; // STOP EXECUTION HERE - prevent correct word from appearing in chat
            }
        }

        // 3. NORMAL CHAT: If it's a wrong guess, or it's just lobby chatter, send to everyone
        io.to(roomId).emit("chat:message", {
            id: Math.random().toString(36).substring(7),
            type: "chat",
            text: message,
            sender: player.name
        });
    });
}
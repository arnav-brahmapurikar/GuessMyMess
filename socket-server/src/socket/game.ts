import type { Server, Socket } from "socket.io";
import type { DefaultEventsMap } from "socket.io";
import type { Room } from "../types/index.js";

// ==========================================
// DTO HELPER: STRIPS CIRCULAR NODE OBJECTS 
// ==========================================
export function getPublicRoom(room: Room) {
    // 1. Strip out the dangerous activeTimer
    const { activeTimer, ...publicRoom } = room;

    // 2. If the game is in the drawing phase, mask the word
    if (publicRoom.gameState === "drawing" && publicRoom.correctWord) {
        publicRoom.correctWord = publicRoom.correctWord.replace(/[a-zA-Z]/g, "_ ");
    }

    return publicRoom;
}

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

    // 3. Broadcast state securely (using the helper!)
    io.to(roomId).emit("room:state", getPublicRoom(room));

    if (drawer) {
        io.to(drawer.id).emit("game:you-are-drawing", word);
    }

    // 4. Start the main Drawing Timer
    const roundDurationMs = (room.timer) * 1000;

    room.activeTimer = setTimeout(() => {
        // --- TIME IS UP ---
        if (drawer) drawer.hasDrawn = true;
        room.gameState = "results";

        // Unmask the word for the results screen
        io.to(roomId).emit("room:state", getPublicRoom(room));

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

    room.players.forEach(p => { p.points += p.pointsThisTurn; p.pointsThisTurn = 0; });

    // 2. If everyone has drawn, increment round
    if (!drawer) {
        startNextRound(io, rooms, roomId);
        return;
    }

    // 3. Reset everyone's guessing status for this turn
    room.players.forEach(p => p.hasGuessed = false);

    // Clear canvas state securely
    room.strokes = [];
    room.undoStrokes = [];
    io.to(roomId).emit("canvas:state", { strokes: [], undoStrokes: [] });

    // --- PHASE 1: Separate message for drawer and non-drawers ---
    room.gameState = "choosing";
    io.to(roomId).emit("room:state", getPublicRoom(room)); // USING HELPER

    const shuffledPool = wordPool.sort(() => 0.5 - Math.random());
    const selectedChoices = shuffledPool.slice(0, 3);

    io.to(roomId).emit("system:message", {
        type: "info",
        message: `${drawer.name} is choosing a word...`
    });

    if (room.activeTimer) clearTimeout(room.activeTimer);

    setTimeout(() => {
        io.to(drawer.id).emit("game:choose-word", selectedChoices);
    }, 500);

    // 2. Start the 10-second fallback timer as normal
    room.activeTimer = setTimeout(() => {
        room.gameState = "drawing";
        const forcedWord = selectedChoices[Math.floor(Math.random() * 3)];
        startDrawingPhase(io, rooms, roomId, forcedWord!);
    }, 10000);
}

export function startNextRound(
    io: Server,
    rooms: Map<string, Room>,
    roomId: string
) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.currentRound = room.currentRound + 1;

    // Check if the game is completely over
    if (room.currentRound > room.maxRounds) {
        room.gameState = "results";
        io.to(roomId).emit("room:state", getPublicRoom(room)); // USING HELPER
        io.to(roomId).emit("system:message", { type: "info", message: "Game Over! Thanks for playing." });
        return;
    }

    // Reset draw status for the new round
    room.players.forEach(p => { p.hasDrawn = false; });

    room.gameState = "round-start";
    io.to(roomId).emit("room:state", getPublicRoom(room)); // USING HELPER

    room.activeTimer = setTimeout(() => {
        startNextTurn(io, rooms, roomId);
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
        if (room.hostId !== socket.id) return;

        room.currentRound = 0;
        startNextRound(io, rooms, roomId);
    });

    // 2. The manual choice from the Drawer
    socket.on("game:word-selected", (roomId, word) => {
        const room = rooms.get(roomId);
        if (!room) return;

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

        const currentDrawer = room.players.find(p => !p.hasDrawn);
        const isDrawer = currentDrawer && currentDrawer.id === socket.id;
        if (isDrawingPhase) {
            // 1. SECRET CHAT
            if (player.hasGuessed || isDrawer) {

                const secretReceivers = room.players.filter(p =>
                    p.hasGuessed || (currentDrawer && p.id === currentDrawer.id)
                );

                secretReceivers.forEach(p => {
                    io.to(p.id).emit("chat:message", {
                        id: Math.random().toString(36).substring(7),
                        type: "secret",
                        text: message,
                        sender: player.name
                    });
                });
                return;

            }

            // 2. CORRECT GUESS
            // 2. CORRECT GUESS

            else if (guess === actualWord) {

                player.hasGuessed = true;

                // Points logic
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



                // Check if EVERYONE has guessed it

                const allGuessed = room.players.every(p =>

                    p.hasGuessed || (currentDrawer && p.id === currentDrawer.id)

                );



                if (allGuessed) {

                    if (room.activeTimer) clearTimeout(room.activeTimer);

                    if (currentDrawer) currentDrawer.hasDrawn = true;



                    room.gameState = "results";

                    io.to(roomId).emit("room:state", getPublicRoom(room)); // USING HELPER



                    room.activeTimer = setTimeout(() => {

                        startNextTurn(io, rooms, roomId);

                    }, 5000);

                }

                return;

            }

            // 3. CLOSE GUESS (TYPO DETECTION)
            else if (actualWord.length > 0) {
                const distance = getLevenshteinDistance(guess, actualWord);

                // Allow 1 typo for short words, 2 typos for words 5+ letters
                const isClose = distance === 1 || (actualWord.length >= 5 && distance === 2);

                if (isClose) {
                    // Send a PRIVATE message ONLY to the sender
                    socket.emit("system:message", {
                        type: "warning", // You might want to style "warning" as orange/yellow on your frontend
                        message: `😲 '${message}' is very close!`
                    });

                    // RETURN IMMEDIATELY. We do NOT want to broadcast this typo to the room!
                    return;
                }
            }
        }

        // 3. NORMAL CHAT
        io.to(roomId).emit("chat:message", {
            id: Math.random().toString(36).substring(7),
            type: "chat",
            text: message,
            sender: player.name
        });


    });

    // 1.5 The manual reset from the Host after a game ends
    socket.on("game:play-again", (roomId) => {
        const room = rooms.get(roomId);
        if (!room) return;
        if (room.hostId !== socket.id) return; // Only host can trigger this
        if (room.gameState !== "results") return; // Only works on the game over screen

        // Clear any lingering timers
        if (room.activeTimer) clearTimeout(room.activeTimer);

        // Reset the room back to a clean slate
        room.gameState = "lobby";
        room.currentRound = 0;
        room.correctWord = "";
        room.strokes = [];
        room.undoStrokes = [];

        // Wipe all player scores and statuses
        room.players.forEach(p => {
            p.points = 0;
            p.pointsThisTurn = 0;
            p.hasDrawn = false;
            p.hasGuessed = false;
        });

        // Broadcast the reset room
        io.to(roomId).emit("room:state", getPublicRoom(room));
        io.to(roomId).emit("system:message", {
            type: "info",
            message: "The host has returned the room to the lobby."
        });
    });

    socket.on("room:leave", (roomId) => {
        handlePlayerLeave(io, socket, rooms, roomId);
    });
}

export function handlePlayerLeave(io: Server, socket: Socket, rooms: Map<string, Room>, roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    if (!player) return;
    // FIX: Find the ACTUAL active drawer before doing anything else
    const currentDrawer = room.players.find(p => !p.hasDrawn);
    const isActiveDrawer = currentDrawer?.id === socket.id &&
        (room.gameState === "drawing" || room.gameState === "choosing");

    // 1. Remove the player
    room.players.splice(playerIndex, 1);

    // Optional cleanup depending on your Socket structure
    socket.data = {};

    // 2. If the room is empty, delete it completely to stop memory leaks
    if (room.players.length === 0) {
        if (room.activeTimer) clearTimeout(room.activeTimer);
        rooms.delete(roomId);
        return;
    }
    if (!room.players[0]) return;
    // 3. If the host left, give host status to the next person in line
    if (room.hostId === socket.id) {
        room.hostId = room.players[0].id;
        io.to(roomId).emit("system:message", { type: "info", message: `${room.players[0].name} is the new host.` });
    }

    io.to(roomId).emit("system:message", { type: "info", message: `${player.name} left the game.` });

    // 4. CRITICAL EDGE CASE: If the drawer left, end the turn immediately!
    if (isActiveDrawer) {
        io.to(roomId).emit("system:message", { type: "system", message: `The drawer left! Skipping turn...` });
        if (room.activeTimer) clearTimeout(room.activeTimer);

        // Jump straight to the results screen
        room.gameState = "results";
        io.to(roomId).emit("room:state", getPublicRoom(room));

        room.activeTimer = setTimeout(() => {
            startNextTurn(io, rooms, roomId);
        }, 5000);
        return;
    }

    // 5. SECONDARY EDGE CASE: If a guesser left, and now everyone remaining has guessed it, end the turn!
    if (room.gameState === "drawing") {
        // We have to re-evaluate the drawer because the array just changed!
        const newCurrentDrawer = room.players.find(p => !p.hasDrawn);

        const allGuessed = room.players.every(p =>
            p.hasGuessed || (newCurrentDrawer && p.id === newCurrentDrawer.id)
        );

        if (allGuessed && room.players.length > 1) {
            if (room.activeTimer) clearTimeout(room.activeTimer);
            if (newCurrentDrawer) newCurrentDrawer.hasDrawn = true;

            room.gameState = "results";
            io.to(roomId).emit("room:state", getPublicRoom(room));

            room.activeTimer = setTimeout(() => {
                startNextTurn(io, rooms, roomId);
            }, 5000);
            return;
        }
    }

    // 6. Normal update for everyone else
    io.to(roomId).emit("room:state", getPublicRoom(room));
}

function getLevenshteinDistance(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // We only keep track of two rows: the previous one and the current one
    let prevRow = new Array(b.length + 1);
    let currRow = new Array(b.length + 1);

    // Initialize the first row
    for (let i = 0; i <= b.length; i++) {
        prevRow[i] = i;
    }

    for (let i = 0; i < a.length; i++) {
        // The first column of the current row is just the row number
        currRow[0] = i + 1;

        for (let j = 0; j < b.length; j++) {
            const cost = a[i] === b[j] ? 0 : 1;
            currRow[j + 1] = Math.min(
                currRow[j] + 1,       // insertion
                prevRow[j + 1] + 1,   // deletion
                prevRow[j] + cost     // substitution
            );
        }

        // Swap the arrays for the next iteration (avoids creating new arrays in memory)
        const temp = prevRow;
        prevRow = currRow;
        currRow = temp;
    }

    // Because of the swap at the end of the loop, the answer is in prevRow
    return prevRow[b.length];
}
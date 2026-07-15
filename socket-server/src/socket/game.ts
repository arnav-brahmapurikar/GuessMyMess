import type { Server, Socket } from "socket.io";
import type { DefaultEventsMap } from "socket.io";
import type { Room } from "../types/index.js";

// ==========================================
// CORE GAME LOOP HELPERS
// ==========================================

// export function startDrawingPhase(
//     io: Server, 
//     rooms: Map<string, Room>, 
//     roomId: string, 
//     word: string
// ) {
//     const room = rooms.get(roomId);
//     if (!room) return;

//     // 1. Kill the 15-second choosing timer
//     if (room.activeTimer) clearTimeout(room.activeTimer);

//     // 2. Set strict drawing state
//     room.correctWord = word;
//     room.gameState = "drawing";
//     room.roundStart = Date.now();

//     const drawer = room.players.find(p => !p.hasDrawn);

//     // 3. DTO Pattern: Mask the word for the public payload
//     const maskedWord = word.replace(/[a-zA-Z]/g, "_ ");
//     const publicRoomState = { ...room, correctWord: maskedWord };

//     // 4. Broadcast state securely
//     io.to(roomId).emit("room:state", publicRoomState);
//     if (drawer) {
//         io.to(drawer.id).emit("game:you-are-drawing", word);
//     }

//     // 5. Start the main Drawing Timer (e.g., 80 seconds)
//     const roundDurationMs = (room.timer) * 1000;
    
//     room.activeTimer = setTimeout(() => {
//         // --- TIME IS UP ---
//         if (drawer) drawer.hasDrawn = true;
//         room.gameState = "results";
        
//         io.to(roomId).emit("system:message", {
//             type: "round_end",
//             message: `Time's up! The word was: ${word}`
//         });
        
//         // Send the unmasked room state so everyone sees the word on the results screen
//         io.to(roomId).emit("room:state", room);

//         // Wait 5 seconds on the results screen, then start the next turn
//         room.activeTimer = setTimeout(() => {
//             startNextTurn(io, rooms, roomId);
//         }, 5000);

//     }, roundDurationMs);
// }

// export function startNextTurn(
//     io: Server, 
//     rooms: Map<string, Room>, 
//     roomId: string
// ) {
//     const room = rooms.get(roomId);
//     if (!room) return;

//     // 1. Find who is drawing next
//     let drawer = room.players.find(p => p.hasDrawn === false);
    
//     // 2. If everyone has drawn, increment round
//     if (!drawer) {
//         startNextRound(io , rooms , roomId);
//         return;
//     }

//     // 3. Reset everyone's guessing status for this turn
//     room.players.forEach(p => p.hasGuessed = false);

//     // --- PHASE 1: The Intro (3 seconds) ---
//     room.gameState = 
//     io.to(roomId).emit("room:state", room);
//     io.to(roomId).emit("system:message", {
//         type: "info",
//         message: `Round ${room.currentRound}! ${drawer?.name} is drawing next.`
//     });

//     if (room.activeTimer) clearTimeout(room.activeTimer);

//     room.activeTimer = setTimeout(() => {
        
//         // --- PHASE 2: Choosing Phase (15 seconds) ---
//         room.gameState = "choosing";
        
//         // TODO: Replace with your actual word generation logic later
//         const wordPool = ["apple", "elephant", "guitar", "mountain", "ocean", "pizza", "astronaut", "castle"];
//         const shuffledPool = wordPool.sort(() => 0.5 - Math.random());
//         const selectedChoices = shuffledPool.slice(0, 3);

//         io.to(roomId).emit("room:state", room); 
//         if (drawer) io.to(drawer.id).emit("game:word-choices", selectedChoices);

//         // AFK Fallback Timer
//         room.activeTimer = setTimeout(() => {
//             const forcedWord = selectedChoices[0];
//             io.to(roomId).emit("system:message", {
//                 type: "info",
//                 message: `${drawer?.name} took too long! A word was auto-selected.`
//             });
//             startDrawingPhase(io, rooms, roomId, forcedWord!);
//         }, 15000);

//     }, 3000);
// }

// export function startNextRound(
//     io: Server, 
//     rooms: Map<string, Room>, 
//     roomId: string
// ) {
//     const room = rooms.get(roomId);
//     if (!room) return;

//     // 1. Find who is drawing next
   
//         room.currentRound = (room.currentRound ) + 1;
        
//         // Check if the game is completely over
//         if (room.currentRound > (room.maxRounds )) {
//             room.gameState = "results"; // Or a dedicated "game-over" state
//             io.to(roomId).emit("room:state", room);
//             io.to(roomId).emit("system:message", { type: "info", message: "Game Over! Thanks for playing." });
//             return;
//         }

//         // Reset draw status for the new round
//     room.players.forEach(p => {p.hasDrawn = false });
    
//     room.gameState = "round-start"
//     io.to(roomId).emit("room:state" , room)
//     room.activeTimer = setTimeout(() => {
//         startNextRound(io , rooms , roomId)
//     }, 5000);
// }

// // ==========================================
// // SOCKET HANDLER ATTACHMENT
// // ==========================================

// export function gameHandler(
//     io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
//     socket: Socket,
//     rooms: Map<string, Room>
// ) {
    
//     // 1. The initial trigger from the Lobby Host
//     socket.on("game:start", (roomId) => {
//         const room = rooms.get(roomId);
//         if (!room) return;
//         if (room.hostId !== socket.id) return; // Only host can start the game
        
//         room.currentRound = 0;
//         startNextRound(io, rooms, roomId);
//     });

//     // 2. The manual choice from the Drawer
//     socket.on("game:word-selected", (roomId, word) => {
//         const room = rooms.get(roomId);
//         if (!room) return;
        
//         // Ensure they can't force a word selection if it's not the choosing phase
//         if (room.gameState !== "choosing") return;
        
//         startDrawingPhase(io, rooms, roomId, word);
//     });

//     // 3. The Chat & Guessing Engine
//     socket.on("chat:send", (roomId, message) => {
//         const room = rooms.get(roomId);
//         if (!room) return;

//         const player = room.players.find(p => p.id === socket.id);
//         if (!player) return;

//         const isDrawingPhase = room.gameState === "drawing";
//         const guess = message.trim().toLowerCase();
//         const actualWord = room.correctWord?.toLowerCase() || "";

//         // CHECK GUESS
//         if (isDrawingPhase && guess === actualWord) {
            
//             if (player.hasGuessed) return; // Prevent spamming points
            
//             // Check if the current drawer is trying to cheat and guess their own word
//             const currentDrawer = room.players.find(p => !p.hasDrawn);
//             if (currentDrawer && currentDrawer.id === socket.id) return;

//             // Mark as correct
//             player.hasGuessed = true;
//             // TODO: Calculate and add to player.score here
            
//             io.to(roomId).emit("system:message", {
//                 type: "success",
//                 message: `✅ ${player.name} guessed the word!`
//             });

//             // Check if EVERYONE (except drawer) has guessed it
//             const allGuessed = room.players.every(p => 
//                 p.hasGuessed || (currentDrawer && p.id === currentDrawer.id)
//             );
            
//             if (allGuessed) {
//                 // Everyone got it right! End the round early.
//                 if (room.activeTimer) clearTimeout(room.activeTimer);
                
//                 if (currentDrawer) currentDrawer.hasDrawn = true;
//                 room.gameState = "results";
                
//                 io.to(roomId).emit("system:message", {
//                     type: "round_end",
//                     message: `Everyone guessed it! The word was ${actualWord}`
//                 });
//                 io.to(roomId).emit("room:state", room);

//                 room.activeTimer = setTimeout(() => {
//                     startNextTurn(io, rooms, roomId);
//                 }, 5000);
//             }

//             return; // EXIT EARLY - Don't show the correct word in chat
//         }

//         // IF WRONG GUESS OR NOT DRAWING PHASE - Send as normal chat message
//         io.to(roomId).emit("chat:message", {
//             id: Math.random().toString(36).substring(7),
//             type: "chat",
//             text: message,
//             sender: player.name
//         });
//     });
// }
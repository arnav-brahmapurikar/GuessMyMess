"use client";

import { useEffect, useState } from "react";
import { Room } from "@/types";
import { Socket } from "socket.io-client";
import { Clock } from "lucide-react";
// Import your actual canvas component
import DrawingCanvas from "@/features/drawing/components/DrawingCanvas"; 
import CanvasHolder from "@/features/drawing/components/CanvasHolder";

export default function GamePanel({
    socket,
    room,
    roomId,
}: {
    socket: Socket;
    room: Room;
    roomId: string;
}) {
    // 1. Identify the drawer
    const currentDrawer = room.players.find((p) => !p.hasDrawn);
    const isDrawer = currentDrawer?.id === socket.id;

    // 2. State for the timer and the word
    const [timeLeft, setTimeLeft] = useState(room.timer);
    const [secretWord, setSecretWord] = useState(room.correctWord); // Defaults to the masked word

    // 3. The Timer Loop
    useEffect(() => {
        if (!room.roundStart) return;
        
        // Calculate the exact end time based on the server timestamp
        const endTime = room.roundStart + (room.timer * 1000);

        const timerInterval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
            setTimeLeft(remaining);
            
            if (remaining <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [room.roundStart, room.timer]);

    // 4. The Word Unmasker (For the Drawer Only)
    useEffect(() => {
        if (!isDrawer) return;

        // When the drawing phase starts, the server privately sends the real word
        const handleYouAreDrawing = (actualWord: string) => {
            setSecretWord(actualWord);
        };

        socket.on("game:you-are-drawing", handleYouAreDrawing);

        return () => {
            socket.off("game:you-are-drawing", handleYouAreDrawing);
        };
    }, [socket, isDrawer]);

    return (
        <div className="flex-1 flex flex-col bg-white rounded-md shadow-xl border-2 border-gray-200 overflow-hidden relative">
            
            {/* TOP BAR: Word & Timer */}
            <div className="h-14 flex items-center justify-between px-6 bg-slate-50 border-b-2 border-slate-200 z-10">
                
                <div className="flex items-center gap-2">
                    {/* If they are guessing, show the drawer's name */}
                    {!isDrawer && (
                        <span className="text-sm font-bold text-gray-500 uppercase mr-4">
                            {currentDrawer?.name} is drawing
                        </span>
                    )}
                    
                    {/* The Word: Either the unmasked word for drawer, or _ _ _ for guessers */}
                    <span className="text-2xl font-bold tracking-[0.3em] uppercase text-gray-800">
                        {isDrawer ? secretWord : room.correctWord}
                    </span>
                </div>

                {/* The Timer */}
                <div className={`flex items-center gap-2 text-2xl font-black ${
                    timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-slate-700"
                }`}>
                    <Clock className="w-6 h-6" strokeWidth={3} />
                    {timeLeft}
                </div>
            </div>

            {/* THE CANVAS */}
            <div className="flex-1 relative cursor-crosshair">
                <CanvasHolder 
                    socket={socket} 
                    roomId={roomId} 
                    isDrawer={isDrawer} // CRITICAL: This prop locks the guessers out!
                />
            </div>
            
        </div>
    );
}
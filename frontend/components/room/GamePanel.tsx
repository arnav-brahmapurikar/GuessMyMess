"use client";

import { useEffect, useState } from "react";
import { Room } from "@/types";
import { Socket } from "socket.io-client";
import { Clock, AlertCircle } from "lucide-react";
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
    const [secretWord, setSecretWord] = useState(room.correctWord); 

    // 3. The Timer Loop
    useEffect(() => {
        if (!room.roundStart) return;
        
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

    // 4. The Word Unmasker
    useEffect(() => {
        if (!isDrawer) return;

        const handleYouAreDrawing = (actualWord: string) => {
            setSecretWord(actualWord);
        };

        socket.on("game:you-are-drawing", handleYouAreDrawing);

        return () => {
            socket.off("game:you-are-drawing", handleYouAreDrawing);
        };
    }, [socket, isDrawer]);

    // Tension Math for the visual bar
    const timePercentage = Math.max(0, Math.min(100, (timeLeft / room.timer) * 100));
    const isLowTime = timeLeft <= 10;

    return (
        <div className="flex-1 flex flex-col bg-slate-900 border-4 border-slate-800 shadow-[8px_8px_0px_#0f172a] overflow-hidden relative">
            
            {/* ARCADE MONITOR HEADER */}
            <div className="bg-slate-950 border-b-4 border-slate-900 p-4 flex flex-col relative shrink-0 shadow-[inset_0px_0px_20px_rgba(0,0,0,0.5)]">
                
                {/* Retro Scanline Overlay just for the header */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-0" />

                <div className="flex justify-between items-end z-10 relative">
                    
                    {/* Left: Drawer Status & The Secret Word */}
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs uppercase tracking-widest font-black flex items-center gap-2">
                            {isDrawer ? (
                                <span className="text-pink-500 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse block shadow-[0_0_8px_#ec4899]"></span>
                                    YOUR TURN TO DRAW
                                </span>
                            ) : (
                                <span className="text-cyan-500">
                                    <span className="text-slate-400">TRANSMISSION FROM:</span> {currentDrawer?.name}
                                </span>
                            )}
                        </span>
                        
                        <span 
                            className={`text-3xl font-mono font-black tracking-[0.3em] uppercase ${isDrawer ? "text-slate-100" : "text-slate-300"}`}
                            style={isDrawer ? { textShadow: "2px 2px 0px #be185d" } : { textShadow: "2px 2px 0px #0f172a" }}
                        >
                            {isDrawer ? secretWord : room.correctWord}
                        </span>
                    </div>

                    {/* Right: Digital Clock Readout */}
                    <div className={`flex flex-col items-end ${isLowTime ? "text-red-500" : "text-yellow-400"}`}>
                        <span className="font-mono text-[10px] tracking-widest uppercase text-slate-500 mb-1">
                            TIME_REMAINING
                        </span>
                        <div className={`flex items-center gap-2 text-4xl font-black font-mono tracking-tighter ${isLowTime ? "animate-pulse drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" : "drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"}`}>
                            {isLowTime ? <AlertCircle className="size-6 animate-bounce" /> : <Clock className="size-6" />}
                            {timeLeft}
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: The Physical Tension Bar */}
                <div className="h-2 w-full bg-slate-900 mt-4 rounded-none overflow-hidden relative z-10 border border-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                    <div 
                        className={`h-full transition-all duration-1000 ease-linear ${isLowTime ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"}`}
                        style={{ width: `${timePercentage}%` }}
                    />
                </div>
            </div>

            {/* THE CANVAS AREA */}
            <div className="flex-1 relative cursor-crosshair bg-zinc-50 shadow-[inset_0px_0px_30px_rgba(0,0,0,0.15)]">
                {/* 
                  Make sure CanvasHolder itself has NO padding, NO borders, and NO background colors! 
                  It should just be a transparent wrapper for the DrawingCanvas now.
                */}
                <CanvasHolder 
                    socket={socket} 
                    roomId={roomId} 
                    isDrawer={isDrawer} 
                />
            </div>
            
        </div>
    );
}
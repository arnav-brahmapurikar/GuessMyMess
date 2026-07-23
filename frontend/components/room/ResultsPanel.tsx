"use client";

import { Room } from "@/types";
import { Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, XCircle, CheckCircle2, Medal, Award } from "lucide-react";
import { useEffect } from "react";
import { soundManager } from "@/lib/sound";

export default function ResultsPanel({
    socket,
    room,
    roomId,
}: {
    socket: Socket;
    room: Room;
    roomId: string;
}) {
    const gameEnded = room.currentRound > room.maxRounds;
    
    const sortedPlayers = gameEnded 
        ? [...room.players].sort((a, b) => (b.points || 0) - (a.points || 0)) 
        : [...room.players].sort((a, b) => (b.pointsThisTurn || 0) - (a.pointsThisTurn || 0));

    // Determine if the person viewing this screen is the host
    const isHost = room.hostId === socket.id;

    useEffect(()=>{soundManager.stopAll();

        // Small timeout buffer to let browser audio context settle
        const soundTimeout = setTimeout(() => {
            if (gameEnded) {
                soundManager.play("gameEnd");
            } else {
                soundManager.play("result");
            }
        }, 50);

        return () => clearTimeout(soundTimeout);},[gameEnded])

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 font-mono relative overflow-hidden">
            
            {/* Background Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-0" />

            <Card className={`w-full max-w-2xl rounded-none border-4 bg-slate-900 shadow-[12px_12px_0px_#020617] relative z-10 transition-all ${
                gameEnded ? "border-amber-500 shadow-[12px_12px_0px_#78350f]" : "border-slate-800"
            }`}>
                <CardHeader className="text-center pb-2 space-y-4 pt-8">
                    <CardTitle className={`text-3xl font-mono font-black tracking-widest uppercase ${
                        gameEnded ? "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" : "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    }`}
                    style={gameEnded ? { textShadow: "3px 3px 0px #78350f" } : { textShadow: "3px 3px 0px #0e7490" }}
                    >
                        {gameEnded ? "🏆 FINAL_LEADERBOARD" : "TURN_OVER!"}
                    </CardTitle>
                    
                    {!gameEnded && (
                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                            <span className="text-xs uppercase tracking-widest text-slate-400 mb-2">The secret word was</span>
                            <div className="bg-slate-950 border-2 border-cyan-500/50 px-6 py-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                                <span className="text-2xl font-mono font-black text-cyan-300 tracking-[0.3em] uppercase">
                                    {room.correctWord}
                                </span>
                            </div>
                        </div>
                    )}
                </CardHeader>
                
                <Separator className="my-4 bg-slate-800" />
                
                <CardContent className="pb-8">
                    <div className="space-y-4">
                        <div className="flex justify-between px-4 pb-1 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
                            <span>PLAYER_ID</span>
                            <span>{gameEnded ? "TOTAL_SCORE" : "POINTS_GAINED"}</span>
                        </div>
                        
                        <div className="max-h-75 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {sortedPlayers.map((player, index) => {
                                const displayScore = gameEnded ? (player.points || 0) : (player.pointsThisTurn || 0);
                                const gotPoints = displayScore > 0;
                                const isDrawer = !gameEnded && player.pointsThisTurn > 0 && !player.hasGuessed; 
                                const isWinner = gameEnded && index === 0;
                                const isRunnerUp = gameEnded && index === 1 && displayScore > 0;

                                return (
                                    <div 
                                        key={player.id} 
                                        className={`flex items-center justify-between p-4 border-2 transition-all ${
                                            isWinner 
                                                ? "bg-amber-950/40 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-[1.01]"
                                                : isRunnerUp 
                                                ? "bg-slate-950 border-slate-600 text-slate-200"
                                                : gotPoints 
                                                ? "bg-emerald-950/30 border-emerald-800 text-emerald-200" 
                                                : "bg-slate-950 border-slate-800 text-slate-400 opacity-60" 
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {isWinner ? (
                                                <Trophy className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
                                            ) : isRunnerUp ? (
                                                <Medal className="w-5 h-5 text-slate-300" />
                                            ) : gotPoints ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-slate-600" />
                                            )}
                                            
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-base tracking-wider">
                                                    {player.name}
                                                </span>
                                                {isDrawer && (
                                                    <span className="text-[10px] bg-pink-950 border border-pink-700 text-pink-400 px-2 py-0.5 uppercase tracking-widest font-black">
                                                        DRAWER
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className={`font-black text-xl font-mono ${
                                            isWinner ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" 
                                            : isRunnerUp ? "text-slate-300"
                                            : gotPoints ? "text-emerald-400" 
                                            : "text-slate-600"
                                        }`}>
                                            {gameEnded ? displayScore : `+${displayScore}`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- PLAY AGAIN SECTION --- */}
                        {gameEnded && (
                            <div className="pt-6 mt-4 border-t border-slate-800 flex flex-col items-center">
                                {isHost ? (
                                    <button 
                                        onClick={() => socket.emit("game:play-again", roomId)}
                                        className="
                                            w-full max-w-sm 
                                            bg-emerald-500 hover:bg-emerald-400 
                                            text-slate-950 font-mono font-black text-lg 
                                            py-4 px-6 rounded-none 
                                            border-2 border-emerald-300
                                            shadow-[4px_4px_0px_#064e3b] 
                                            active:shadow-[0px_0px_0px_#064e3b] 
                                            active:translate-y-1 active:translate-x-1
                                            transition-all uppercase tracking-widest
                                        "
                                    >
                                        RETURN_TO_LOBBY
                                    </button>
                                ) : (
                                    <div className="bg-slate-950 border border-slate-800 px-6 py-3 w-full text-center">
                                        <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest animate-pulse">
                                            WAITING_FOR_HOST_TO_RESET...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* ------------------------------ */}

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
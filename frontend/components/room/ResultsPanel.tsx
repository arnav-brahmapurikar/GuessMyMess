"use client";

import { Room } from "@/types";
import { Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trophy, XCircle, CheckCircle2, Medal } from "lucide-react";

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

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-50/50">
            <Card className={`w-full max-w-2xl shadow-xl transition-all ${
                gameEnded ? "border-amber-300 shadow-amber-500/20" : "border-muted"
            }`}>
                <CardHeader className="text-center pb-2 space-y-4">
                    <CardTitle className={`text-4xl font-black tracking-tight ${
                        gameEnded ? "text-amber-500" : "text-slate-800"
                    }`}>
                        {gameEnded ? "🏆 Final Leaderboard" : "Turn Over!"}
                    </CardTitle>
                    
                    {!gameEnded && (
                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                            <p className="text-muted-foreground font-medium mb-1">The word was</p>
                            <Badge variant="default" className="text-2xl px-6 py-2 uppercase tracking-widest bg-green-500 hover:bg-green-600">
                                {room.correctWord}
                            </Badge>
                        </div>
                    )}
                </CardHeader>
                
                <Separator className="my-4" />
                
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between px-4 pb-2 text-sm font-bold text-muted-foreground uppercase tracking-wider border-b">
                            <span>Player</span>
                            <span>{gameEnded ? "Total Score" : "Points Gained"}</span>
                        </div>
                        
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                            {sortedPlayers.map((player, index) => {
                                const displayScore = gameEnded ? (player.points || 0) : (player.pointsThisTurn || 0);
                                const gotPoints = displayScore > 0;
                                const isDrawer = !gameEnded && player.pointsThisTurn > 0 && !player.hasGuessed; 
                                const isWinner = gameEnded && index === 0;
                                const isRunnerUp = gameEnded && index === 1 && displayScore > 0;

                                return (
                                    <div 
                                        key={player.id} 
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                            isWinner ? "bg-amber-100 border-amber-300 scale-[1.02] shadow-sm"
                                            : isRunnerUp ? "bg-slate-100 border-slate-300"
                                            : gotPoints ? "bg-green-50/50 border-green-200" 
                                            : "bg-slate-50 border-slate-100 opacity-75" 
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {isWinner ? (
                                                <Trophy className="w-6 h-6 text-amber-500 fill-amber-500" />
                                            ) : isRunnerUp ? (
                                                <Medal className="w-5 h-5 text-slate-400" />
                                            ) : gotPoints ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-slate-300" />
                                            )}
                                            
                                            <span className={`font-bold text-lg ${
                                                isWinner ? "text-amber-900" : gotPoints || gameEnded ? "text-slate-800" : "text-slate-500"
                                            }`}>
                                                {player.name}
                                                {isDrawer && <span className="ml-2 text-xs text-blue-500 font-bold uppercase tracking-wider">(Drawer)</span>}
                                            </span>
                                        </div>
                                        
                                        <div className={`font-black text-xl ${
                                            isWinner ? "text-amber-600" 
                                            : isRunnerUp ? "text-slate-600"
                                            : gotPoints ? "text-green-600" 
                                            : "text-slate-400"
                                        }`}>
                                            {gameEnded ? displayScore : `+${displayScore}`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- NEW PLAY AGAIN SECTION --- */}
                        {gameEnded && (
                            <div className="pt-6 mt-4 border-t flex flex-col items-center">
                                {isHost ? (
                                    <button 
                                        onClick={() => socket.emit("game:play-again", roomId)}
                                        className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-3 px-6 rounded-xl shadow-md transition-transform active:scale-95"
                                    >
                                        Return to Lobby
                                    </button>
                                ) : (
                                    <p className="text-muted-foreground font-semibold animate-pulse">
                                        Waiting for host to return to lobby...
                                    </p>
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
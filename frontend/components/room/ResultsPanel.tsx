"use client";

import { Room } from "@/types";
import { Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trophy, XCircle, CheckCircle2 } from "lucide-react";

export default function ResultsPanel({
    socket, // We don't strictly need to emit anything here, but good to have
    room,
    roomId,
}: {
    socket: Socket;
    room: Room;
    roomId: string;
}) {
    // Sort players by who got the most points this turn
    const sortedPlayers = [...room.players].sort((a, b) => b.pointsThisTurn - a.pointsThisTurn);

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-50/50">
            <Card className="w-full max-w-2xl shadow-xl border-muted">
                <CardHeader className="text-center pb-2 space-y-4">
                    <CardTitle className="text-4xl font-black tracking-tight text-slate-800">
                        Turn Over!
                    </CardTitle>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-muted-foreground font-medium mb-1">The word was</p>
                        <Badge variant="default" className="text-2xl px-6 py-2 uppercase tracking-widest bg-green-500 hover:bg-green-600">
                            {room.correctWord}
                        </Badge>
                    </div>
                </CardHeader>
                
                <Separator className="my-4" />
                
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between px-4 pb-2 text-sm font-bold text-muted-foreground uppercase tracking-wider border-b">
                            <span>Player</span>
                            <span>Points Gained</span>
                        </div>
                        
                        <div className="max-h-75 overflow-y-auto space-y-2 pr-2">
                            {sortedPlayers.map((player) => {
                                const gotPoints = player.pointsThisTurn > 0;
                                const isDrawer = player.pointsThisTurn > 0 && !player.hasGuessed; // Drawer gets points but didn't "guess"

                                return (
                                    <div 
                                        key={player.id} 
                                        className={`flex items-center justify-between p-3 rounded-lg border ${
                                            gotPoints 
                                                ? "bg-green-50/50 border-green-100" 
                                                : "bg-slate-50 border-slate-100"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {gotPoints ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-slate-300" />
                                            )}
                                            <span className={`font-semibold ${gotPoints ? "text-slate-800" : "text-slate-500"}`}>
                                                {player.name}
                                                {isDrawer && <span className="ml-2 text-xs text-blue-500 font-bold uppercase">(Drawer)</span>}
                                            </span>
                                        </div>
                                        
                                        <div className={`font-black ${gotPoints ? "text-green-600" : "text-slate-400"}`}>
                                            +{player.pointsThisTurn}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
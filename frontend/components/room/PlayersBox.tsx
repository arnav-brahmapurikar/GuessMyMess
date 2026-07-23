"use client";

import { Room, Player } from "@/types";
import { Card } from "@/components/ui/card";
import { Crown, MoreVertical, Zap, Brush } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";

export default function PlayersBox({
    room,
    socket
}: {
    room: Room;
    socket: Socket;
}) {
    const me = room.players.find((p: Player) => p.id === socket.id);
    const amHost = me?.id === room.hostId;

    // 1. Find the current drawer based on your backend logic
    const currentDrawer = room.players.find(p => !p.hasDrawn);

    return (
        <Card className="h-full rounded-none border-2 border-slate-800 flex flex-col overflow-hidden bg-slate-900 shadow-[4px_4px_0px_#0f172a]">
            
            {/* RETRO HEADER */}
            <div className="py-4 px-4 border-b-2 border-slate-800 bg-slate-950 flex justify-between items-center">
                <h2 className="text-sm font-mono font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <UsersIcon className="size-4" />
                    PLAYERS [{room.players.length}]
                </h2>
            </div>

            {/* PLAYER LIST */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                {room.players.map((player: Player) => {
                    const isMe = player.id === socket.id;
                    const isHost = player.id === room.hostId;
                    
                    // 2. Check if THIS specific player is currently drawing/choosing
                    const isActiveDrawer = 
                        currentDrawer?.id === player.id && 
                        (room.gameState === "drawing" || room.gameState === "choosing");

                    return (
                        <div
                            key={player.id}
                            className={`
                                relative p-3 flex items-center justify-between bg-slate-950 border-2 transition-all
                                ${isMe 
                                    ? "border-cyan-500 shadow-[2px_2px_0px_rgba(6,182,212,0.4)]" 
                                    : "border-slate-800 shadow-[2px_2px_0px_#0f172a]"
                                }
                                ${isActiveDrawer ? "border-pink-500/50 shadow-[2px_2px_0px_rgba(236,72,153,0.3)]" : ""}
                            `}
                        >
                            <div className="flex flex-col gap-1.5 w-full">
                                <div className="flex items-center gap-2">
                                    {isHost && (
                                        <Crown 
                                            className="text-yellow-400 size-4 drop-shadow-[0_0_5px_rgba(250,204,21,0.6)] flex-shrink-0" 
                                        />
                                    )}
                                    <span className={`font-mono font-bold uppercase tracking-wide text-sm truncate ${isMe ? "text-cyan-400" : "text-slate-200"}`}>
                                        {player.name}
                                    </span>
                                    
                                    {/* 3. THE DRAWING INDICATOR */}
                                    {isActiveDrawer && (
                                        <span className="flex items-center gap-1 ml-auto text-[10px] font-mono font-black text-pink-400 bg-pink-950/50 px-2 py-0.5 border border-pink-900/50 animate-pulse">
                                            <Brush className="size-3" />
                                            {room.gameState === "choosing" ? "CHOOSING" : "DRAWING"}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="font-mono text-xs font-bold text-slate-500 flex items-center gap-1">
                                    <Zap className="size-3 text-emerald-400" />
                                    <span className="text-emerald-400">{player.points}</span> PTS
                                </div>
                            </div>

                            {/* HOST CONTROLS */}
                            {amHost && !isHost && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute right-2 top-2 hover:bg-slate-800 text-slate-500 hover:text-pink-500 rounded-none h-6 w-6 transition-colors"
                                        >
                                            <MoreVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    
                                    <DropdownMenuContent 
                                        className="bg-slate-950 border-2 border-slate-700 rounded-none font-mono text-xs uppercase"
                                    >
                                        <DropdownMenuItem
                                            className="text-red-400 hover:bg-red-950/50 hover:text-red-300 focus:bg-red-950/50 focus:text-red-300 cursor-pointer rounded-none"
                                            onClick={() => {
                                                socket.emit("lobby:kick", room.id, player.id);
                                            }}
                                        >
                                            [ KICK PLAYER ]
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

function UsersIcon(props: any) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
    )
}
"use client";

import { Room } from "@/types";
import { Copy, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function TopBar({
    room,
    roomId,
}: {
    room: Room;
    roomId: string;
}) {
    function copyRoomCode() {
        navigator.clipboard.writeText(roomId);
        toast.success("ROOM CODE COPIED TO CLIPBOARD");
    }

    const isGameFinished = room.maxRounds + 1 === room.currentRound;

    return (
        <header
            className="
                h-16
                shrink-0
                border-b-2
                border-slate-800
                bg-slate-950
                px-6
                flex
                items-center
                justify-between
                relative
                z-20
            "
        >
            {/* LEFT: Arcade Logo */}
            <div className="flex-shrink-0 w-64">
                <h1
                    className="text-2xl font-black uppercase tracking-tighter text-slate-100"
                    style={{ textShadow: "2px 2px 0px #06b6d4, 4px 4px 0px #0f172a" }}
                >
                    Guess
                    <span 
                        className="text-pink-500 mx-1" 
                        style={{ textShadow: "2px 2px 0px #be185d, 4px 4px 0px #0f172a" }}
                    >
                        My
                    </span>
                    Mess
                </h1>
            </div>

            {/* MIDDLE: Game / Lobby Readout */}
            <div className="flex-1 flex justify-center items-center">
                {room.gameState === "lobby" ? (
                    
                    /* LOBBY STATE: Room Code & Copy */
                    <div className="flex items-center gap-3 bg-slate-900 border-2 border-slate-800 p-1 pl-4 shadow-[4px_4px_0px_#0f172a]">
                        <span className="font-mono text-sm uppercase tracking-widest text-slate-400">
                            ID: <span className="text-cyan-400 font-bold ml-1">{roomId}</span>
                        </span>
                        
                        <button
                            onClick={copyRoomCode}
                            className="
                                bg-pink-600 hover:bg-pink-500 text-white p-2
                                border-2 border-pink-400
                                shadow-[2px_2px_0px_#831843] active:shadow-[0px_0px_0px_#831843]
                                active:translate-y-0.5 active:translate-x-0.5
                                transition-all
                            "
                            title="Copy Room Code"
                        >
                            <Copy className="size-4" />
                        </button>
                    </div>

                ) : (

                    /* GAME STATE: Round Tracker Only */
                    <div className="flex items-center justify-center font-mono uppercase tracking-widest border-2 border-slate-800 bg-slate-900 px-6 py-2 shadow-[4px_4px_0px_#0f172a]">
                        {isGameFinished ? (
                            <span className="text-pink-500 font-bold flex items-center gap-2">
                                <AlertTriangle className="size-4" />
                                GAME OVER
                            </span>
                        ) : (
                            <span className="text-slate-300 text-sm font-bold">
                                ROUND <span className="text-cyan-400 ml-2">{room.currentRound}</span>
                                <span className="text-slate-600 mx-2">/</span>
                                <span className="text-slate-500">{room.maxRounds}</span>
                            </span>
                        )}
                    </div>

                )}
            </div>

            {/* RIGHT: Player Count */}
            <div className="flex-shrink-0 w-80 flex justify-end">
                <div className="flex items-center gap-2 border-2 border-slate-800 bg-slate-900 px-3 py-1 shadow-[2px_2px_0px_#0f172a]">
                    <Users className="size-4 text-cyan-500" />
                    <span className="font-mono text-sm font-bold text-cyan-400">
                        {room.players.length} <span className="text-slate-500 font-normal">PLYRS</span>
                    </span>
                </div>
            </div>
        </header>
    );
}
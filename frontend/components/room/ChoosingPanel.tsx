"use client";

import { useEffect, useState } from "react";
import { Room } from "@/types";
import { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil } from "lucide-react";

export default function ChoosingPanel({
    socket,
    room,
    roomId,
}: {
    socket: Socket;
    room: Room;
    roomId: string;
}) {
    const [wordChoices, setWordChoices] = useState<string[]>([]);
    const [hasSelected, setHasSelected] = useState(false);

    // 1. Figure out who is drawing right now
    const currentDrawer = room.players.find((p) => !p.hasDrawn);
    const isDrawer = currentDrawer?.id === socket.id;
    const drawerName = currentDrawer?.name || "Someone";

    // 2. Listen for the secret words (ONLY the drawer will receive this)
    useEffect(() => {
        if (!isDrawer) return;

        const handleChooseWord = (words: string[]) => {
            setWordChoices(words);
        };

        socket.on("game:choose-word", handleChooseWord);

        return () => {
            socket.off("game:choose-word", handleChooseWord);
        };
    }, [socket, isDrawer]);

    // 3. Handle the drawer clicking a word
    const handleWordSelect = (word: string) => {
        setHasSelected(true); // Disable buttons immediately to prevent double-clicks
        socket.emit("game:word-selected", roomId, word);
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 font-mono relative overflow-hidden">
            
            {/* Background Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-0" />

            <Card className="w-full max-w-xl rounded-none border-4 border-slate-800 bg-slate-900 shadow-[12px_12px_0px_#020617] relative z-10 overflow-hidden">
                <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle 
                        className="text-3xl font-mono font-black tracking-widest uppercase text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                        style={{ textShadow: "3px 3px 0px #0e7490" }}
                    >
                        {isDrawer ? "CHOOSE_YOUR_WORD" : "TRANSMISSION_INCOMING"}
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="flex flex-col items-center justify-center pt-6 pb-10 px-8 min-h-[220px]">
                    
                    {/* VIEW A: I AM THE DRAWER */}
                    {isDrawer ? (
                        <div className="flex flex-col items-center w-full space-y-6">
                            <p className="text-slate-400 text-sm uppercase tracking-widest text-center">
                                &gt; SELECT A TARGET TO DRAW. TIME IS TICKING...
                            </p>
                            
                            {wordChoices.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                    {wordChoices.map((word) => (
                                        <Button
                                            key={word}
                                            onClick={() => handleWordSelect(word)}
                                            disabled={hasSelected}
                                            className="
                                                text-base font-mono uppercase font-black tracking-wider 
                                                h-16 w-full rounded-none 
                                                bg-slate-950 border-2 border-cyan-500 text-cyan-300
                                                shadow-[4px_4px_0px_#0e7490] hover:bg-cyan-500 hover:text-slate-950
                                                active:shadow-[0px_0px_0px_#0e7490] active:translate-y-1 active:translate-x-1
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                transition-all
                                            "
                                        >
                                            {word}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-6">
                                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                                    <span className="text-xs text-slate-500 tracking-widest uppercase">GENERATING_WORDS...</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* VIEW B: I AM A GUESSER */
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative flex items-center justify-center w-20 h-20 bg-slate-950 border-2 border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                                <Pencil className="h-8 w-8 text-pink-500 animate-pulse" />
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-mono font-bold text-slate-200 tracking-wider">
                                    WAITING FOR <span className="text-pink-500 uppercase">{drawerName}</span>
                                </h2>
                                <p className="text-xs text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                                    &gt; SELECTING SECRET WORD...
                                </p>
                            </div>
                        </div>
                    )}
                    
                </CardContent>
            </Card>
        </div>
    );
}
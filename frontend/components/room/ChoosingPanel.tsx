"use client";

import { useEffect, useState } from "react";
import { Room } from "@/types";
import { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil } from "lucide-react"; // Lucide icons come standard with shadcn

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
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-50/50">
            <Card className="w-full max-w-lg shadow-lg border-muted">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-black tracking-tight text-slate-800">
                        {isDrawer ? "It's your turn!" : "Waiting..."}
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 min-h-[200px]">
                    
                    {/* VIEW A: I AM THE DRAWER */}
                    {isDrawer ? (
                        <div className="flex flex-col items-center w-full space-y-6">
                            <p className="text-muted-foreground text-lg text-center">
                                Choose a word to draw. You have 10 seconds!
                            </p>
                            
                            {wordChoices.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                                    {wordChoices.map((word) => (
                                        <Button
                                            key={word}
                                            variant="default"
                                            size="lg"
                                            onClick={() => handleWordSelect(word)}
                                            disabled={hasSelected}
                                            className="text-lg font-bold capitalize h-16 w-full"
                                        >
                                            {word}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            )}
                        </div>
                    ) : (
                        /* VIEW B: I AM A GUESSER */
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full">
                                <Pencil className="h-10 w-10 text-primary animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-700 text-center">
                                Waiting for <span className="text-primary font-bold">{drawerName}</span>
                            </h2>
                            <p className="text-muted-foreground animate-pulse">
                                to choose a word...
                            </p>
                        </div>
                    )}
                    
                </CardContent>
            </Card>
        </div>
    );
}
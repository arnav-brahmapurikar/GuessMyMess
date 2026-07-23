"use client";

import { soundManager } from "@/lib/sound";
import { Room } from "@/types";
import { useEffect } from "react";

export default function RoundStartPanel({ room }: { room: Room }) {

    useEffect(()=>{
        soundManager.play("roundStart")


        return ()=>{
        }
    }, [])

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 rounded-none border-4 border-slate-800 shadow-[8px_8px_0px_#0f172a] relative overflow-hidden font-mono">
            
            {/* Background Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-0" />

            {/* Content Container */}
            <div className="z-10 relative flex flex-col items-center">
                <span className="text-6xl animate-bounce mb-6 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                    🚀
                </span>
                
                <h1 
                    className="text-5xl font-mono font-black text-cyan-400 tracking-widest uppercase drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                    style={{ textShadow: "3px 3px 0px #0e7490, 6px 6px 0px #020617" }}
                >
                    ROUND_{room.currentRound}
                </h1>
                
                <p className="text-lg text-slate-400 mt-6 uppercase tracking-[0.3em] animate-pulse">
                    &gt; PREPARE_FOR_TRANSMISSION...
                </p>
            </div>
            
        </div>
    );
}
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Lock, Play } from "lucide-react";

export default function LandingCard({ 
    roomCreate 
}: { 
    roomCreate: (name: string) => void 
}) {
    const [name, setName] = useState("Player");

    return (
        <Card
            className="
                mt-12
                mx-auto
                w-full
                max-w-md
                bg-slate-900
                border-2
                border-cyan-500/50
                rounded-sm
                shadow-[8px_8px_0px_rgba(6,182,212,0.2)]
            "
        >
            <CardContent className="p-8 space-y-6">
                
                {/* 
                    TERMINAL INPUT 
                */}
                <div className="space-y-2">
                    <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                        Display Name_
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => {
                            // FIX: Save the actual new value to local storage, not the old state
                            const newValue = e.target.value;
                            localStorage.setItem("name", newValue);
                            setName(newValue);
                        }}
                        placeholder="ENTER NAME"
                        className="
                            h-14
                            bg-slate-950
                            border-2
                            border-slate-700
                            focus-visible:border-cyan-400
                            focus-visible:ring-0
                            text-cyan-50
                            text-lg
                            font-mono
                            rounded-none
                            placeholder:text-slate-600
                        "
                    />
                </div>

                <div className="space-y-4 pt-2">
                    {/* 
                        DISABLED RETRO BUTTON 
                    */}
                    <Button
                        disabled
                        className="
                            w-full
                            h-14
                            text-lg
                            bg-slate-950
                            border-2
                            border-slate-800
                            text-slate-600
                            font-mono
                            uppercase
                            tracking-widest
                            rounded-none
                            opacity-100
                        "
                    >
                        <Play className="mr-3 size-5" />
                        Public Match
                        <span className="ml-3 px-2 py-0.5 bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                            SOON
                        </span>
                    </Button>

                    {/* 
                        ACTION RETRO BUTTON (Tactile push down effect)
                    */}
                    <Button
                        className="
                            w-full
                            h-14
                            text-lg
                            bg-pink-600
                            hover:bg-pink-500
                            text-white
                            font-mono
                            uppercase
                            font-bold
                            tracking-widest
                            rounded-none
                            border-2
                            border-pink-400
                            shadow-[4px_4px_0px_#831843]
                            hover:shadow-[4px_4px_0px_#831843]
                            active:shadow-[0px_0px_0px_#831843]
                            active:translate-y-1
                            active:translate-x-1
                            transition-all
                        "
                        onClick={() => { roomCreate(name) }}
                    >
                        <Lock className="mr-3 size-5" />
                        Create Private
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
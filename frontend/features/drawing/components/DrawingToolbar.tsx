"use client";

import { Slider } from "@/components/ui/slider";
import {
    Brush,
    Eraser,
    PaintBucket,
    Trash2,
    Undo2,
    Redo2
} from "lucide-react";
import { Tool } from "../types";

const colors = [
    // ROW 1: Neutrals & Warm Tones
    "#000000", // Pure Black
    "#64748b", // Slate Grey
    "#ffffff", // Pure White
    "#78350f", // Arcade Brown (Essential!)
    "#ef4444", // Arcade Red
    "#f97316", // Neon Orange
    "#facc15", // Arcade Yellow
    "#4ade80", // Lime Green
    
    // ROW 2: Cool Tones & Neons
    "#10b981", // Toxic Emerald
    "#06b6d4", // Neon Cyan
    "#0284c7", // Deep Ocean Blue
    "#3b82f6", // Electric Blue
    "#6366f1", // Synth Indigo
    "#a855f7", // Deep Synthwave Purple
    "#d946ef", // Magenta
    "#ec4899", // Hot Pink
];

type Props = {
    tool: Tool;
    setTool: (tool: Tool) => void;
    color: string;
    setColor: (color: string) => void;
    width: number;
    setWidth: (value: number) => void;
    clear: () => void;
    undo: () => void;
    redo: () => void;
};

export default function DrawingToolbar({
    tool,
    setTool,
    color,
    setColor,
    width,
    setWidth,
    clear,
    undo,
    redo
}: Props) {
    return (
        <div className="flex items-center justify-between gap-4 px-2 py-1">
            
            {/* COLORS: Physical Light-up Pads */}
            <div className="grid grid-cols-8 gap-1.5 p-1 bg-slate-950 border border-slate-800 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                {colors.map((c) => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                        className={`
                            size-6 
                            rounded-none 
                            border-2 
                            transition-all 
                            active:scale-95
                            ${color === c 
                                ? "border-white shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110 z-10" 
                                : "border-slate-900 opacity-80 hover:opacity-100 hover:scale-105"
                            }
                        `}
                        title={`Color: ${c}`}
                    />
                ))}
            </div>

            {/* HARDWARE DIVIDER */}
            <div className="w-1 h-10 bg-slate-950 border-r border-slate-800" />

            {/* SIZE SLIDER: Digital Readout */}
            <div className="flex items-center gap-3 bg-slate-950 border-2 border-slate-800 px-3 py-1.5 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
                <Brush size={14} className="text-cyan-500" />
                <Slider
                    value={[width]}
                    onValueChange={(v) => setWidth(v[0])}
                    min={1}
                    max={30}
                    className="w-24 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-cyan-400 w-4 text-right">
                    {width}
                </span>
            </div>

            {/* HARDWARE DIVIDER */}
            <div className="w-1 h-10 bg-slate-950 border-r border-slate-800" />

            {/* TOOLS: Tactile Push-Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => setTool("pen")}
                    className={`size-10 flex items-center justify-center border-2 rounded-none transition-all ${
                        tool === "pen"
                            ? "bg-cyan-500 border-cyan-300 text-slate-900 shadow-[inset_3px_3px_0px_rgba(255,255,255,0.4)] translate-y-0.5 translate-x-0.5"
                            : "bg-slate-950 border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 shadow-[3px_3px_0px_#020617] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_#020617]"
                    }`}
                    title="Pen Tool"
                >
                    <Brush size={18} />
                </button>

                <button
                    onClick={() => setTool("eraser")}
                    className={`size-10 flex items-center justify-center border-2 rounded-none transition-all ${
                        tool === "eraser"
                            ? "bg-pink-500 border-pink-300 text-slate-900 shadow-[inset_3px_3px_0px_rgba(255,255,255,0.4)] translate-y-0.5 translate-x-0.5"
                            : "bg-slate-950 border-slate-700 text-slate-400 hover:border-pink-500/50 hover:text-pink-400 shadow-[3px_3px_0px_#020617] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_#020617]"
                    }`}
                    title="Eraser"
                >
                    <Eraser size={18} />
                </button>

                <button
                    onClick={() => setTool("fill")}
                    className={`size-10 flex items-center justify-center border-2 rounded-none transition-all ${
                        tool === "fill"
                            ? "bg-emerald-500 border-emerald-300 text-slate-900 shadow-[inset_3px_3px_0px_rgba(255,255,255,0.4)] translate-y-0.5 translate-x-0.5"
                            : "bg-slate-950 border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 shadow-[3px_3px_0px_#020617] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_#020617]"
                    }`}
                    title="Fill Bucket"
                >
                    <PaintBucket size={18} />
                </button>
            </div>

            {/* HARDWARE DIVIDER */}
            <div className="w-1 h-10 bg-slate-950 border-r border-slate-800" />

            {/* ACTIONS: History & Danger Switches */}
            <div className="flex gap-2">
                <button 
                    onClick={undo} 
                    title="Undo"
                    className="size-10 flex items-center justify-center border-2 border-slate-700 bg-slate-950 text-slate-400 rounded-none shadow-[3px_3px_0px_#020617] hover:text-slate-100 hover:border-slate-500 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                >
                    <Undo2 size={18} />
                </button>
                
                <button 
                    onClick={redo} 
                    title="Redo"
                    className="size-10 flex items-center justify-center border-2 border-slate-700 bg-slate-950 text-slate-400 rounded-none shadow-[3px_3px_0px_#020617] hover:text-slate-100 hover:border-slate-500 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                >
                    <Redo2 size={18} />
                </button>

                <button 
                    onClick={clear} 
                    title="NUKE CANVAS"
                    className="size-10 flex items-center justify-center border-2 border-red-900 bg-red-950 text-red-500 rounded-none shadow-[3px_3px_0px_#450a0a] hover:bg-red-600 hover:text-white hover:border-red-400 hover:shadow-[3px_3px_0px_#7f1d1d] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all ml-2"
                >
                    <Trash2 size={18} />
                </button>
            </div>
            
        </div>
    );
}
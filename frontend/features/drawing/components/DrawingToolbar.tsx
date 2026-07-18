"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

import {
    Brush,
    Eraser,
    PaintBucket,
    Trash2,
    Undo2,
    Redo2
} from "lucide-react";

const colors = [
    "#000000",
    "#ef4444",
    "#22c55e",
    "#3b82f6",
    "#eab308",
    "#a855f7",
    "#ec4899",
    "#f97316",
];

type Props = {
    tool: "pen" | "eraser";
    setTool: (tool: "pen" | "eraser") => void;

    color: string;
    setColor: (color: string) => void;

    width: number;
    setWidth: (value: number) => void;

    // These MUST come from the parent so the parent can redraw the <canvas>
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
        <div className="h-20 rounded-2xl border bg-white/90 shadow-sm flex items-center justify-between px-6">
            
            {/* Colors */}
            <div className="flex gap-3">
                {colors.map((c) => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                        className={`size-8 rounded-full transition hover:scale-110 ${
                            color === c ? "ring-4 ring-black/30" : ""
                        }`}
                    />
                ))}
            </div>

            <Separator orientation="vertical" className="h-10 mx-2" />

            {/* Size */}
            <div className="flex items-center gap-3">
                <Brush size={18} className="text-slate-600" />
                <Slider
                    value={[width]}
                    onValueChange={(v) => setWidth(v[0])}
                    min={1}
                    max={30}
                    className="w-32"
                />
                <span className="text-sm font-medium w-6 text-slate-600">
                    {width}
                </span>
            </div>

            <Separator orientation="vertical" className="h-10 mx-2" />

            {/* Tools */}
            <div className="flex gap-2">
                <Toggle
                    pressed={tool === "pen"}
                    onPressedChange={() => setTool("pen")}
                    aria-label="Toggle Pen"
                >
                    <Brush size={18} />
                </Toggle>

                <Toggle
                    pressed={tool === "eraser"}
                    onPressedChange={() => setTool("eraser")}
                    aria-label="Toggle Eraser"
                >
                    <Eraser size={18} />
                </Toggle>

                <Toggle
                    disabled
                    aria-label="Toggle Fill"
                >
                    <PaintBucket size={18} className="opacity-50" />
                </Toggle>
            </div>

            <Separator orientation="vertical" className="h-10 mx-2" />

            {/* Actions: Undo, Redo, Clear */}
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={undo} title="Undo">
                    <Undo2 size={18} className="text-slate-700" />
                </Button>
                
                <Button variant="ghost" size="icon" onClick={redo} title="Redo">
                    <Redo2 size={18} className="text-slate-700" />
                </Button>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={clear} 
                    title="Clear Canvas"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-1"
                >
                    <Trash2 size={18} />
                </Button>
            </div>
            
        </div>
    );
}
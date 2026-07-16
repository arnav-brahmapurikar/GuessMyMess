"use client";

import { useState } from "react";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import DrawingCanvas from "./DrawingCanvas";
import DrawingToolbar from "./DrawingToolbar";
import { Socket } from "socket.io-client";

// 1. Add isDrawer to your props
export default function CanvasHolder({roomId, socket, isDrawer} : {roomId : string , socket : Socket, isDrawer: boolean}) {
    const [tool, setTool] = useState<"pen" | "eraser">("pen");
    const [color, setColor] = useState("#000000");
    const [width, setWidth] = useState(5);

    function clearCanvas() {}

    return (
        <Card className="h-full rounded-3xl p-4 shadow-xl">
            <CardContent className="h-full p-0 flex flex-col gap-4">
                
                {/* Drawing Area */}
                <div className="flex-1 overflow-hidden rounded-2xl border bg-white">
                    <DrawingCanvas
                        socket={socket}
                        roomId={roomId}
                        tool={tool}
                        color={color}
                        width={width}
                        isDrawer={isDrawer} // 2. Pass it down!
                    />
                </div>

                {/* 3. Hide the toolbar entirely if they are just guessing */}
                {isDrawer && (
                    <DrawingToolbar
                        tool={tool}
                        setTool={setTool}
                        color={color}
                        setColor={setColor}
                        width={width}
                        setWidth={setWidth}
                        clear={clearCanvas}
                    />
                )}
            </CardContent>
        </Card>
    );
}
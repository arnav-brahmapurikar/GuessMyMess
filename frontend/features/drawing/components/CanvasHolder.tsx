"use client";

import DrawingCanvas from "./DrawingCanvas";
import { Socket } from "socket.io-client";

export default function CanvasHolder({
    roomId, 
    socket, 
    isDrawer,
}: {
    roomId: string;
    socket: Socket;
    isDrawer: boolean;
}) {
    return (
        /* 
          This wrapper is completely invisible! 
          The borders and shadows are now handled by GamePanel.
          We just need it to fill the available space.
        */
        <div className="w-full h-full relative">
            
            <DrawingCanvas
                socket={socket}
                roomId={roomId}
                isDrawer={isDrawer} 
            />

            {/* 
                NOTE: This is exactly where we will drop your Tool Dock 
                (Color picker, brush size, clear button) later! 
                Because it is 'relative', the dock can float nicely over the canvas.
            */}

        </div>
    );
}
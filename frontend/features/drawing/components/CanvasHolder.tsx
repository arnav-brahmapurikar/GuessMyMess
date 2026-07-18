"use client";

import { Card, CardContent } from "@/components/ui/card";
import DrawingCanvas from "./DrawingCanvas";
import { Socket } from "socket.io-client";

export default function CanvasHolder({
    roomId, 
    socket, 
    isDrawer
}: {
    roomId: string, 
    socket: Socket, 
    isDrawer: boolean
}) {
    return (
        <Card className="h-full rounded-3xl p-4 shadow-xl">
            <CardContent className="h-full p-0 flex flex-col gap-4">
                
                {/* Drawing Area */}
                <div className="flex-1 overflow-hidden rounded-2xl border bg-slate-50 relative">
                    <DrawingCanvas
                        socket={socket}
                        roomId={roomId}
                        isDrawer={isDrawer} 
                    />
                </div>

            </CardContent>
        </Card>
    );
}
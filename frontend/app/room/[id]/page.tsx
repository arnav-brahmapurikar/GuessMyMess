"use client"
import DrawingCanvas from "@/features/drawing/components/DrawingCanvas";
import ChatBox from "@/components/room/ChatBox";
import CanvasHolder from "@/features/drawing/components/CanvasHolder";
import { useSocket } from "@/features/sockets/useSocket";
import { use, useEffect, useState } from "react";
import { Room } from "@/types";
import PlayersBox from "@/components/room/PlayersBox";
import TopBar from "@/components/room/TopBar";
import CentralPanel from "@/components/room/CentralPanel";

export default function RoomPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const [room, setRoom] = useState<Room | null>(null)
    const { id } = use(params);
    const socket = useSocket();

    useEffect(() => {
        let username = localStorage.getItem("name");
        if (!username) username = "Player";

        const handleRoomState = (room: Room) => {
            setRoom(room);
        };
        
        socket.on("room:state", handleRoomState);
        socket.emit("room:join", id, username);

        return () => {
            socket.off("room:state", handleRoomState);
        };
    }, [id, socket]);

    return (
        <main 
            className="
                h-screen 
                flex flex-col 
                bg-slate-950 
                text-slate-100
                selection:bg-pink-500 selection:text-white
                relative
                overflow-hidden
            "
        >
            {/* RETRO BACKGROUND TEXTURES */}
            <div 
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    backgroundPosition: 'center center'
                }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020617_100%)] z-0 pointer-events-none" />

            {/* MAIN GAME UI (Z-10 to sit above the background) */}
            {room && (
                <div className="relative z-10 flex flex-col h-full">
                    
                    <TopBar roomId={room.id} room={room} />

                    {/* TRI-PANEL LAYOUT */}
                    <div className="flex flex-1 overflow-hidden p-4 gap-4">
                        
                        {/* LEFT COLUMN: Fixed width for Players */}
                        <div className="w-64 flex-shrink-0 flex flex-col">
                            <PlayersBox
                                room={room}
                                socket={socket}
                            />
                        </div>

                        {/* CENTER COLUMN: Fluid width for Canvas/Lobby */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <CentralPanel
                                roomId={room.id}
                                room={room}
                                socket={socket}
                            />
                        </div>

                        {/* RIGHT COLUMN: Fixed width for Chat */}
                        <div className="w-80 flex-shrink-0 flex flex-col">
                            <ChatBox
                                room={room.id}
                                socket={socket}
                            />
                        </div>

                    </div>
                </div>
            )}
        </main>
    );
}
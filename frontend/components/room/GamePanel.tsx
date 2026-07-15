"use client";

import { Room } from "@/types";
import { Socket } from "socket.io-client";

import CanvasHolder from "@/features/drawing/components/CanvasHolder";

export default function GamePanel({
    room,
    socket,
    roomId,
}: {
    room: Room;
    socket: Socket;
    roomId: string;
}) {

    return (

        <section
            className="
            flex-1
            rounded-2xl
            overflow-hidden
            "
        >

            <CanvasHolder
                roomId={roomId}
                socket={socket}
            />

        </section>

    );

}
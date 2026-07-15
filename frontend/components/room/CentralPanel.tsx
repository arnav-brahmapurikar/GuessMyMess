"use client";

import { Room } from "@/types";
import { Socket } from "socket.io-client";

import LobbyPanel from "./lobby/LobbyPanel";
import ChoosingPanel from "./ChoosingPanel";
import GamePanel from "./GamePanel";
import ResultsPanel from "./ResultsPanel";

export default function CenterPanel({
    socket,
    room,
    roomId,
}: {
    socket: Socket;
    room: Room;
    roomId: string;
}) {

    switch (room.gameState) {

        case "lobby":
            return (
                <LobbyPanel
                    socket={socket}
                    room={room}
                    roomId={roomId}
                />
            );

        case "choosing":
            return (
                <ChoosingPanel
                    socket={socket}
                    room={room}
                    roomId={roomId}
                />
            );

        case "drawing":
            return (
                <GamePanel
                    socket={socket}
                    room={room}
                    roomId={roomId}
                />
            );

        case "results":
            return (
                <ResultsPanel
                    socket={socket}
                    room={room}
                    roomId={roomId}
                />
            );

        default:
            return null;
    }
}
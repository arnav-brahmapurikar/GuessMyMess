"use client";

import { Room } from "@/types";
import { Socket } from "socket.io-client";
import TopBar from "./TopBar";
import PlayersBox from "./PlayersBox";
import LobbySettings from "./LobbySettings";
import ChatBox from "./ChatBox";

export default function Lobby({
    room,
    socket,
}:{
    room: Room;
    socket: Socket;
}){

    return(

        <main className="h-screen bg-slate-100 p-6">

            <TopBar room={room} roomId={room.id}/>

            <div className="mt-6 grid grid-cols-[260px_1fr_330px] gap-6 h-[calc(100%-96px)]">

                <PlayersBox
                    room={room}
                    socket={socket}
                />

                <LobbySettings
                    room={room}
                    socket={socket}
                />

                <ChatBox
                    room={room.id}
                    socket={socket}
                />

            </div>

        </main>

    )

}
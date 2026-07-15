"use client"
import DrawingCanvas from "@/features/drawing/components/DrawingCanvas";
import ChatBox from "@/components/room/ChatBox";
import CanvasHolder from "@/features/drawing/components/CanvasHolder";
import { useSocket } from "@/features/sockets/useSocket";
import { use, useEffect, useState } from "react";
import { Room } from "@/types";
import PlayersBox from "@/components/room/PlayersBox";
import TopBar from "@/components/room/TopBar";
import Loadable from "next/dist/shared/lib/loadable.shared-runtime";
import CentralPanel from "@/components/room/CentralPanel";


export default function RoomPage({
  params
}: {
  params: Promise<{
    id: string
  }>
}) {

  const [room, setRoom] = useState<Room | null>(null)
  const { id } = use(params);
 
  const socket =
    useSocket();


  useEffect(() => {
    let username =
      localStorage.getItem("name");

      if (!username)username = "Player";

      console.log("running ")
    const handleRoomState = (room: Room) => {
      console.log(room)
      console.log("mil gya ")
      setRoom(room);
    };
    socket.on(
      "room:state",
      handleRoomState
    );
    console.log("yoyo honey singh")
    socket.emit(
      "room:join",
      id,
      username
    );



    return () => {
      socket.off(
        "room:state",
        handleRoomState
      );
    };

  }, [id , socket]);

  return (
    <main className="h-screen flex flex-col">

    {room && <><TopBar roomId={room.id} room={room} />

    <div className="flex flex-1 overflow-hidden gap-4">

        <PlayersBox
            room={room}
            socket={socket}
        />

        <CentralPanel
            roomId={room.id}
            room={room}
            socket={socket}
        />

        <ChatBox
        room={room.id}
            socket={socket}
        />

    </div></>}

</main>
  );
}
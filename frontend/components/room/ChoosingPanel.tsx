"use client";

import { Room } from "@/types";
import { Socket } from "socket.io-client";

export default function ChoosingPanel({
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
            border
            bg-white
            shadow-sm
            p-8
            flex
            items-center
            justify-center
            "
        >

            <h1 className="text-4xl font-bold">

                Choose a word

            </h1>

        </section>

    );

}
"use client";

import { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";

export default function TopBar({
    room,
    roomId,
}: {
    room: Room;
    roomId: string;
}) {

    function copyRoomCode() {

        navigator.clipboard.writeText(roomId);

        toast.success("Room code copied!");

    }

    return (

        <header
            className="
            h-20
            rounded-2xl
            border
            bg-white/80
            backdrop-blur-md
            shadow-sm
            px-6
            flex
            items-center
            justify-between
            "
        >

            {/* Left */}

            <div>

                <h1
                    className="
                    text-3xl
                    font-black
                    tracking-tight
                    text-violet-600
                    "
                >
                    GuessMyMess
                </h1>

            </div>

            {/* Middle */}

            {

                room.gameState === "lobby"

                    ?

                    <div
                        className="
                        flex
                        items-center
                        gap-3
                        "
                    >

                        <Badge
                            variant="secondary"
                        >
                            Room {roomId}
                        </Badge>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyRoomCode}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>

                    </div>

                    :

                    <div
                        className="
                        flex
                        items-center
                        gap-4
                        "
                    >

                        <Badge>

                            Round {room.currentRound + 1}/{room.maxRounds}

                        </Badge>

                        <Badge
                            variant="secondary"
                        >

                            ⏱ {room.timer}s

                        </Badge>

                    </div>

            }

            {/* Right */}

            <div
                className="
                flex
                items-center
                gap-2
                "
            >

                <Users
                    size={18}
                />

                <span
                    className="
                    font-medium
                    "
                >
                    {room.players.length}
                </span>

            </div>

        </header>

    );

}
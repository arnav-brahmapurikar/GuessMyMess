import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

import React from 'react'
import { Socket } from "socket.io-client";
import { Room } from "@/types";

export default function LobbySettings({room , socket} : {room : Room , socket : Socket}) {
  return (
    <div><Card className="h-full p-6 flex flex-col">

<h2 className="text-xl font-bold mb-6">

Lobby Settings

</h2>

<div className="space-y-5">

<Select>
...
</Select>

<Select>
...
</Select>

</div>

<div className="mt-auto flex gap-4">

<Button
className="flex-1"
size="lg"
>

Start Game

</Button>

<Button
variant="secondary"
size="lg"
>

Invite

</Button>

</div>

</Card></div>
  )
}

import { Room } from "@/types";
import { Card } from "@/components/ui/card";
import { Crown, MoreVertical } from "lucide-react";
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";
import { Player } from "@/types";

export default function PlayersBox({
room,
socket
}:{
room:Room
socket:Socket
}){

const me =
room.players.find(
(p : Player)=>p.id===socket.id
);

const amHost =
me?.id===room.hostId;

return(

<Card className="p-4 h-full">

<h2 className="font-bold text-lg mb-4">

Players

</h2>

<div className="space-y-3">

{

room.players.map((player: Player )=>(

<Card
key={player.id}
className="
relative
p-3
flex
items-center
justify-between
hover:bg-slate-50
transition
"
>

<div>

<div className="font-semibold">

{player.name}

</div>

<div className="text-sm text-muted-foreground">

{player.points} pts

</div>

</div>

{

player.id===room.hostId&&(

<Crown
className="
absolute
bottom-2
left-2
text-yellow-500
h-4
w-4
"
/>

)

}

{

amHost&&
player.id!==room.hostId&&(

<DropdownMenu>

<DropdownMenuTrigger asChild>

<Button
size="icon"
variant="ghost"
>

<MoreVertical/>

</Button>

</DropdownMenuTrigger>

<DropdownMenuContent>

<DropdownMenuItem

onClick={()=>{

socket.emit(
"lobby:kick",
room.id,
player.id
)

}}

>

Kick Player

</DropdownMenuItem>

</DropdownMenuContent>

</DropdownMenu>

)

}

</Card>

))

}

</div>

</Card>

)

}
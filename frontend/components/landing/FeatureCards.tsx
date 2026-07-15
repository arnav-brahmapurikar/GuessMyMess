import {
    Card,
    CardContent
} from "@/components/ui/card";

import {
    Brush,
    Users,
    Zap
} from "lucide-react";

const features=[
{
title:"Realtime Canvas",
icon:Brush,
description:"Ultra smooth collaborative drawing powered by WebSockets."
},
{
title:"Private Rooms",
icon:Users,
description:"Invite friends instantly with secure room codes."
},
{
title:"Lightning Fast",
icon:Zap,
description:"Low latency gameplay built with Next.js and Socket.IO."
}
];

export default function FeatureCards(){

return(

<div
className="
grid
gap-6
mt-14

md:grid-cols-3
"
>

{
features.map(feature=>{

const Icon=feature.icon;

return(

<Card
key={feature.title}

className="
bg-white/10
border-white/20
backdrop-blur-xl
"
>

<CardContent
className="
p-6
text-center
space-y-4
"
>

<Icon
className="
mx-auto
size-10
text-yellow-300
"
/>

<h3
className="
text-xl
font-bold
text-white
"
>
{feature.title}
</h3>

<p
className="
text-white/70
"
>
{feature.description}
</p>

</CardContent>

</Card>

);

})
}

</div>

);

}
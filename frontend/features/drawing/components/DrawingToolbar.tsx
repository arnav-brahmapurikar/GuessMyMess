"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

import {
    Brush,
    Eraser,
    PaintBucket,
    Trash2
} from "lucide-react";



const colors = [
    "#000000",
    "#ef4444",
    "#22c55e",
    "#3b82f6",
    "#eab308",
    "#a855f7",
    "#ec4899",
    "#f97316",
];


type Props = {

    tool: "pen" | "eraser";
    setTool:(tool:"pen" | "eraser")=>void;

    color:string;
    setColor:(color:string)=>void;

    width:number;
    setWidth:(value:number)=>void;

    clear:()=>void;
}


export default function DrawingToolbar({
    tool,
    setTool,

    color,
    setColor,

    width,
    setWidth,

    clear

}:Props){


return (

<div
className="
h-20
rounded-2xl
border
bg-white/90
shadow-sm

flex
items-center
justify-between

px-6
"
>


    {/* colors */}

    <div className="flex gap-3">

        {
        colors.map((c)=>(

            <button

                key={c}

                onClick={()=>
                    setColor(c)
                }

                style={{
                    backgroundColor:c
                }}

                className={`
                size-8
                rounded-full
                transition
                hover:scale-110

                ${
                  color===c
                  ?"ring-4 ring-black/30"
                  :""
                }
                `}
            />

        ))
        }

    </div>



    <Separator
        orientation="vertical"
    />



    {/* size */}

    <div
    className="
    flex
    items-center
    gap-3
    "
    >

        <Brush size={18}/>

        <Slider

            value={[width]}

            onValueChange={(v)=>
                setWidth(v[0])
            }

            min={1}
            max={30}

            className="w-32"

        />


        <span
        className="
        text-sm
        w-8
        "
        >
            {width}
        </span>


    </div>



    <Separator
        orientation="vertical"
    />




    {/* tools */}

    <div className="flex gap-2">


        <Toggle

            pressed={
                tool==="pen"
            }

            onPressedChange={()=>
                setTool("pen")
            }

        >
            <Brush size={18}/>
        </Toggle>



        <Toggle

            pressed={
                tool==="eraser"
            }

            onPressedChange={()=>
                setTool("eraser")
            }

        >
            <Eraser size={18}/>
        </Toggle>



        <Toggle

            pressed={
                tool==="pen"
            }

            onPressedChange={()=>
                setTool("pen")
            }

        >
            <PaintBucket size={18}/>
        </Toggle>


        


    </div>


</div>

)

}
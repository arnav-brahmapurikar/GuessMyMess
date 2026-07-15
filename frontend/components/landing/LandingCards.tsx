"use client";

import { useState } from "react";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
    Pencil,
    Lock,
    Play
} from "lucide-react";

export default function LandingCard(
    { roomCreate} : {
        roomCreate : (name : string)=> void
    }
) {

    const [name,setName]=
        useState("Player");

    return (

        <Card
            className="
            mt-10
            mx-auto
            w-full
            max-w-md

            border-white/20

            bg-white/10

            backdrop-blur-xl

            shadow-2xl
            "
        >

            <CardContent
                className="
                p-8
                space-y-5
                "
            >

                <Input

                    value={name}

                    onChange={e=>{
                        localStorage.setItem("name", name )
                        setName(e.target.value)

                    }}

                    placeholder="Player"

                    className="
                    h-12

                    bg-white

                    text-lg
                    "
                />

                <Button

                    disabled

                    className="
                    w-full
                    h-12

                    text-lg

                    bg-emerald-500

                    hover:bg-emerald-500
                    "
                >

                    <Play className="mr-2 size-5"/>

                    Play
                    <span className="ml-2 text-xs">
                        Soon
                    </span>

                </Button>

                <Button

                    variant="secondary"

                    className="
                    w-full
                    h-12
                    text-lg
                    "

                    onClick={
                        () => {roomCreate(name)}
                    }
                > 
                    

                    <Lock className="mr-2 size-5"/>

                    Create Private Room

                </Button>

            </CardContent>

        </Card>

    );

}
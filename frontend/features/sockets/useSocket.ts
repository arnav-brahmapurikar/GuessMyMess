"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";


export function useSocket(
    
){

    useEffect(()=>{


        if(!socket.connected){

            socket.connect();


        }



    },[]);


    return socket;
}
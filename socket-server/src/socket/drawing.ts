import { Server, Socket, type DefaultEventsMap } from "socket.io";
import type { Stroke } from "../types/index.js";


export function drawingHandler(
    io :  Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket:Socket,
    rooms : Map<
        string,{
            strokes :Stroke[],
            undoStrokes : Stroke[],

        }
    >
){


    socket.on(
        "stroke:start",
        (data)=>{

            console.log('starts')
            socket
            .to(data.roomId)
            .emit(
                "stroke:start",
                data
            );
            rooms.get(data.roomId)?.strokes.push(data.stroke)
        }
    );
    socket.on(
        "stroke:undo",
        (data)=>{
            socket
            .to(data.roomId)
            .emit(
                "stroke:undo"
            );
            let room = rooms.get(data.roomId)
            if(room){

    const stroke = room.strokes.pop();

    if(stroke){
        room.undoStrokes.push(stroke);
    }

}


        }
    );
    socket.on(
        "stroke:redo",
        (data)=>{
            socket
            .to(data.roomId)
            .emit(
                "stroke:redo"
            );
            
            let room = rooms.get(data.roomId)
            if(room){

    const stroke = room.undoStrokes.pop();

    if(stroke){
        room.strokes.push(stroke);
    }

}

        }
    );

    socket.on(
"stroke:update",
({roomId, strokeId , point})=>{


    const stroke = rooms.get(roomId)?.strokes.find(s => s.id === strokeId)
    if(stroke){
        stroke.points.push(point)
    }

    socket
    .to(roomId)
    .emit(
        "stroke:update",
        {
            strokeId,
            point
        }
    );


});

    



}
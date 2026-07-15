"use client";

import { useEffect, useRef, useState } from "react";
import { Tool, Stroke, Point } from "../types";
import { Button } from "@/components/ui/button";
import { Redo2, Undo2 } from "lucide-react";
import { Socket } from "socket.io-client";

export default function DrawingCanvas({socket, roomId , color ,
 width,
 tool} : {
  socket : Socket, 
  color : string,
 width: number,
 roomId : string ,
 tool: "pen" | "eraser" }) {

  const strokes = useRef<Stroke[]>([]);
  const UndoStrokes = useRef<Stroke[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [historyState, setHistoryState] = useState({
    canUndo:false,
    canRedo:false
});

  const drawing = useRef(false);

  const currentStroke =
    useRef<Stroke | null>(null);

  const lastPoint = useRef({
    x:0,
    y:0
  });


  useEffect(()=>{

socket.on("canvas:state", ({strokes : serverStrokes, undoStrokes : ServerUndoStrokes} : {strokes : Stroke[], undoStrokes : Stroke[]} )=>{
  strokes.current = serverStrokes;
  UndoStrokes.current = ServerUndoStrokes
  redrawCanvas()
  updateHistoryState()
})

socket.on(
"stroke:start",
({stroke})=>{
  console.log("start")
    strokes.current.push(stroke);
  UndoStrokes.current = []
  updateHistoryState()
});

socket.on(
"stroke:undo",
()=>{

    applyUndo();

});


socket.on(
"stroke:redo",
()=>{

    applyRedo();

});

socket.on(
"stroke:update",
({strokeId, point}) => {
  console.log("continue")

    const stroke =
        strokes.current.find(
            s => s.id === strokeId
        );


    if(!stroke)
        return;


    const lastPoint = stroke.points[stroke.points.length - 1];

    stroke.points.push(point);

    drawLine(
        lastPoint,
        point,
        stroke
    );


});



return ()=>{

    socket.off("stroke:start");
    socket.off("stroke:update");
    socket.off("stroke:undo");
    socket.off("stroke:redo");  
}


},[]);


  function drawLine(
    from:Point,
    to:Point,
    stroke:Stroke
){

const ctx =
canvasRef.current!
.getContext("2d")!;


ctx.beginPath();

ctx.moveTo(
    from.x,
    from.y
);


ctx.lineTo(
    to.x,
    to.y
);


ctx.lineWidth =
    stroke.width;


if(stroke.tool==="eraser"){

ctx.globalCompositeOperation =
"destination-out";

}else{

ctx.globalCompositeOperation =
"source-over";

if(stroke.color)ctx.strokeStyle = stroke.color;

}


ctx.stroke();


}

  // setup canvas

  useEffect(()=>{

    const canvas = canvasRef.current;
    if(!canvas) return;


    const parent =
      canvas.parentElement!;


    canvas.width =
      parent.clientWidth;

    canvas.height =
      parent.clientHeight;


    const ctx =
      canvas.getContext("2d")!;


    ctx.lineCap = "round";
    ctx.lineJoin = "round";


  },[]);


  
function updateHistoryState(){

    setHistoryState({

        canUndo:
            strokes.current.length > 0,

        canRedo:
            UndoStrokes.current.length > 0

    });

}

  function getPoint(
    e:React.MouseEvent
  ){

    const rect =
      canvasRef.current!
      .getBoundingClientRect();


    return {
      x:e.clientX - rect.left,
      y:e.clientY - rect.top
    };

  }



  function startDrawing(
    e:React.MouseEvent
  ){

    drawing.current=true;

    lastPoint.current =
      getPoint(e);

    UndoStrokes.current = []
    currentStroke.current = {
      id: crypto.randomUUID(),
      
      color,
      
      width,
      
      tool,
      
      points: [
        lastPoint.current
      ]
    };
    socket.emit(
    "stroke:start",
    {stroke :currentStroke.current, 
      roomId : roomId
    }
    );
    updateHistoryState()

  }




  function draw(
    e:React.MouseEvent
  ){

    if(!drawing.current)
        return;


    const canvas =
      canvasRef.current!;


    const ctx =
      canvas.getContext("2d")!;

       

     if (!ctx)
        return;


    const point =
        getPoint(e);


    currentStroke
        .current
        ?.points
        .push(point);

    socket.emit(
    "stroke:update",
    { 
        roomId : roomId,
        strokeId:
        currentStroke.current?.id,
        point
    }
);
      
    ctx.beginPath();


    ctx.moveTo(
        lastPoint.current.x,
        lastPoint.current.y
    );


    ctx.lineTo(
        point.x,
        point.y
    );


    if (tool === "eraser") {

        ctx.globalCompositeOperation =
            "destination-out";

    }
    else {

        ctx.globalCompositeOperation =
            "source-over";

        ctx.strokeStyle =
            color;

    }


    ctx.lineWidth =
        width;

    ctx.stroke();

    
    lastPoint.current =
        point;

  }



  function stopDrawing(){

    drawing.current=false;
    if(currentStroke.current){

        strokes.current.push(
            currentStroke.current
        );

        updateHistoryState()
        currentStroke.current = null;
    }

  }

  function applyUndo(){

    const stroke =
        strokes.current.pop();


    if(!stroke)
        return;


    UndoStrokes.current.push(
        stroke
    );


    redrawCanvas();

    updateHistoryState();

}



function applyRedo(){

    const stroke =
        UndoStrokes.current.pop();


    if(!stroke)
        return;


    strokes.current.push(
        stroke
    );


    redrawCanvas();

    updateHistoryState();

}
  function undo(){

    applyUndo();


    socket.emit(
        "stroke:undo",
        {roomId}
    );

}


function redo(){

    applyRedo();


    socket.emit(
        "stroke:redo",
        {roomId}
    );

}

  function redrawCanvas(){

    const canvas = canvasRef.current;
    if(!canvas) return;


    const ctx = canvas.getContext("2d");
    if(!ctx) return;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    for(const stroke of strokes.current){


        if(stroke.tool === "eraser"){

            ctx.globalCompositeOperation =
                "destination-out";

        }else{

            ctx.globalCompositeOperation =
                "source-over";

            ctx.strokeStyle =
                stroke.color? stroke.color : "black" ;

        }


        ctx.lineWidth =
            stroke.width;


        ctx.lineCap = "round";
        ctx.lineJoin = "round";


        ctx.beginPath();


        ctx.moveTo(
            stroke.points[0].x,
            stroke.points[0].y
        );


        for(const point of stroke.points){

            ctx.lineTo(
                point.x,
                point.y
            );

        }


        ctx.stroke();

    }


    ctx.globalCompositeOperation =
        "source-over";

}

  return (
     <div
        className="
        relative
        h-full
        w-full
        "
    >

        <canvas

            style={{
                cursor: getCursor(
                    width,
                    color,
                    tool
                )
            }}

            ref={canvasRef}

            className="
            w-full
            h-full
            bg-white
            rounded-2xl
            "

            onMouseDown={startDrawing}

            onMouseMove={draw}

            onMouseUp={stopDrawing}

            onMouseLeave={stopDrawing}

        />



        {/* Undo Button */}

        <Button
    
                onClick={undo}
    
                disabled={!historyState.canUndo}
    
                size="icon"
    
                variant="secondary"
    
                className="
                absolute
                top-4
                right-14
    
                rounded-full
    
                bg-white/80
                backdrop-blur-md
    
                shadow-lg
    
                hover:scale-110
                transition
                "
    
            >
    
                <Undo2
                    size={18}
                />
    
            </Button>
             <Button
    
                onClick={redo}
    
                disabled={!historyState.canRedo}
    
                size="icon"
    
                variant="secondary"
    
                className="
                absolute
                top-4
                right-4
    
                rounded-full
    
                bg-white/80
                backdrop-blur-md
    
                shadow-lg
    
                hover:scale-110
                transition
                "
    
            >
    
                <Redo2
                    size={18}
                />
    
            </Button>


    </div>
  );
}



function getCursor(
    width: number,
    color: string,
    tool: Tool
) {

    const cursorSize =
        Math.max(14, width * 1.5);


    const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${cursorSize}"
      height="${cursorSize}"
    >
      <circle
        cx="${cursorSize / 2}"
        cy="${cursorSize / 2}"
        r="${cursorSize / 2 - 3}"
        fill="white"
        stroke="${tool === "eraser" ? "black" : color}"
        stroke-width="2"
      />
    </svg>
    `;


    return `url("data:image/svg+xml;base64,${btoa(svg)}") 
    ${cursorSize / 2} 
    ${cursorSize / 2}, auto`;
}
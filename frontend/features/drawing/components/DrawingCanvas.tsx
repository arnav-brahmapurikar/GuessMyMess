"use client";

import { useEffect, useRef, useState } from "react";
import { Tool, Stroke, Point } from "../types";
import { Socket } from "socket.io-client";
import DrawingToolbar from "./DrawingToolbar"; // <-- Import the toolbar!
import executeFloodFill from "../algorithm/FloodFill";

export default function DrawingCanvas({
    socket, 
    roomId, 
    isDrawer
} : {
    socket: Socket, 
    roomId: string,
    isDrawer: boolean 
}) {
    // 1. Moved State down from CanvasHolder
    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState("#000000");
    const [width, setWidth] = useState(5);
    const strokes = useRef<Stroke[]>([]);
    const UndoStrokes = useRef<Stroke[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [historyState, setHistoryState] = useState({
        canUndo:false,
        canRedo:false
    });
    const pendingPoints = useRef<Point[]>([]);
    const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
    //use queue to distribute drawing to reduce jitterness
    const renderQueue = useRef<{from: Point, to: Point, stroke: Stroke}[]>([]);
    const isRendering = useRef(false);

    const drawing = useRef(false);
    const currentStroke = useRef<Stroke | null>(null);
    const lastPoint = useRef({ x:0, y:0 });

    useEffect(() => {
        socket.on("canvas:state", ({strokes: serverStrokes, undoStrokes: ServerUndoStrokes}: {strokes: Stroke[], undoStrokes: Stroke[]}) => {
            strokes.current = serverStrokes;
            UndoStrokes.current = ServerUndoStrokes;
            redrawCanvas();
            updateHistoryState();
        });

        socket.on("stroke:start", ({stroke}) => {
            strokes.current.push(stroke);
            UndoStrokes.current = [];
            updateHistoryState();
            if (stroke.tool === "fill") {
                const ctx = canvasRef.current?.getContext("2d");
                if (ctx) {
                    executeFloodFill(ctx, stroke.points[0].x, stroke.points[0].y, stroke.color);
                }
            }
        });

        socket.on("stroke:undo", () => {
            applyUndo();
        });

        socket.on("stroke:redo", () => {
            applyRedo();
        });

        // ✅ NEW: Expecting an array of points
        socket.on("stroke:update", ({strokeId, points}: {strokeId: string, points: Point[]}) => {
            const stroke = strokes.current.find(s => s.id === strokeId);
            if(!stroke) return;
            
            let lastP = stroke.points[stroke.points.length - 1];
            
            for (const pt of points) {
                if (!lastP) lastP = pt;
                
                // 1. Still save it to our main data array instantly
                stroke.points.push(pt); 
                
                // 2. Instead of drawing it directly, push it to our animation queue!
                renderQueue.current.push({ from: lastP, to: pt, stroke });
                
                lastP = pt; 
            }

            // 3. Kick off the animation loop if it isn't already running
            if (!isRendering.current) {
                isRendering.current = true;
                requestAnimationFrame(processRenderQueue);
            }
        });

        //  Explicitly ask for the canvas state now that we are ready to listen!
        socket.emit("canvas:request-state", roomId);

        return () => {
            socket.off("stroke:start");
            socket.off("stroke:update");
            socket.off("stroke:undo");
            socket.off("stroke:redo");  
            socket.off("canvas:state");
        }
    }, []);

    function drawLine(from: Point, to: Point, stroke: Stroke) {
        const ctx = canvasRef.current!.getContext("2d");
        if(!ctx)return ;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.lineWidth = stroke.width;

        if (stroke.tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
        } else {
            ctx.globalCompositeOperation = "source-over";
            if(stroke.color) ctx.strokeStyle = stroke.color;
        }
        ctx.stroke();
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        const parent = canvas.parentElement!;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, []);

    function processRenderQueue() {
        if (renderQueue.current.length === 0) {
            isRendering.current = false;
            return;
        }

        // THE MATH: A standard monitor runs at 60 Frames Per Second (~16ms per frame).
        // Since our data arrives every 50ms, exactly 3 monitor frames will pass between each network update.
        // By dividing the queue length by 3, we perfectly spread the drawing out across those 3 frames!
        const pointsToDraw = Math.max(1, Math.ceil(renderQueue.current.length / 3));

        for (let i = 0; i < pointsToDraw; i++) {
            const op = renderQueue.current.shift();
            if (op) {
                drawLine(op.from, op.to, op.stroke);
            }
        }

        // Tell the browser to run this again on the next frame
        requestAnimationFrame(processRenderQueue);
    }

    function updateHistoryState() {
        setHistoryState({
            canUndo: strokes.current.length > 0,
            canRedo: UndoStrokes.current.length > 0
        });
    }

    function getPoint(e: React.MouseEvent) {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function startDrawing(e: React.MouseEvent) {
        if (!isDrawer) return;
        
        const point = getPoint(e);
        const ctx = canvasRef.current!.getContext("2d")!;
        
        // 🚀 NEW: Intercept the click if it's the Paint Bucket
        if (tool === "fill") {
            const fillStroke: Stroke = {
                id: crypto.randomUUID(),
                color,
                width,
                tool: "fill",
                points: [point] // We only need the starting coordinate!
            };
            
            // Execute locally instantly
            executeFloodFill(ctx, point.x, point.y, color);
            
            // Save to history and broadcast to the room
            strokes.current.push(fillStroke);
            UndoStrokes.current = [];
            updateHistoryState();
            socket.emit("stroke:start", { stroke: fillStroke, roomId });
            
            // Return early so the draw() function doesn't fire
            return;
        }
        drawing.current = true;
        lastPoint.current = getPoint(e);
        UndoStrokes.current = [];
        currentStroke.current = {
            id: crypto.randomUUID(),
            color,
            width,
            tool,
            points: [lastPoint.current]
        };
        socket.emit("stroke:start", {stroke: currentStroke.current, roomId: roomId});
        updateHistoryState();
    }

    function draw(e: React.MouseEvent) {
        if (!drawing.current) return;
        const ctx = canvasRef.current!.getContext("2d")!;
        if (!ctx) return;
        
        const point = getPoint(e);
        currentStroke.current?.points.push(point);
        pendingPoints.current.push(point); 
        
        // If a timer isn't already running, start one!
        if (!throttleTimeout.current) {
            throttleTimeout.current = setTimeout(() => {
                // When 50ms passes, send the batch
                if (pendingPoints.current.length > 0) {
                    socket.emit("stroke:update", { 
                        roomId: roomId, 
                        strokeId: currentStroke.current?.id, 
                        points: pendingPoints.current 
                    });
                    pendingPoints.current = [];
                }
                // Clear the ref so the next mouse movement can start a new timer
                throttleTimeout.current = null; 
            }, 50);
        }
        
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(point.x, point.y);

        if (tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = color;
        }

        ctx.lineWidth = width;
        ctx.stroke();
        lastPoint.current = point;
    }

    function stopDrawing() {
        drawing.current = false;
        if (currentStroke.current) {
            
            // 1. Cancel the pending timer if it exists
            if (throttleTimeout.current) {
                clearTimeout(throttleTimeout.current);
                throttleTimeout.current = null;
            }

            // 2. Flush any leftover points instantly
            if (pendingPoints.current.length > 0) {
                socket.emit("stroke:update", { 
                    roomId: roomId, 
                    strokeId: currentStroke.current?.id, 
                    points: pendingPoints.current 
                });
                pendingPoints.current = [];
            }
            
            strokes.current.push(currentStroke.current);
            updateHistoryState();
            currentStroke.current = null;
        }
    }

    function applyUndo() {
        const stroke = strokes.current.pop();
        if(!stroke) return;
        UndoStrokes.current.push(stroke);
        redrawCanvas();
        updateHistoryState();
    }

    function applyRedo() {
        const stroke = UndoStrokes.current.pop();
        if(!stroke) return;
        strokes.current.push(stroke);
        redrawCanvas();
        updateHistoryState();
    }

    // 2. Uncommented and wired up the action functions
    function undo() {
        applyUndo();
        socket.emit("stroke:undo", {roomId});
    }

    function redo() {
        applyRedo();
        socket.emit("stroke:redo", {roomId});
    }

    function clear() {
        strokes.current = [];
        UndoStrokes.current = [];
        redrawCanvas();
        updateHistoryState();
        //  backend 
        socket.emit("canvas:clear", {roomId}); 
    }

    function redrawCanvas() {
        renderQueue.current = [];
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext("2d");
        if(!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const stroke of strokes.current) {
            if (stroke.tool === "fill") {
                executeFloodFill(ctx, stroke.points[0].x, stroke.points[0].y, stroke.color!);
                continue;
            }
            if (stroke.tool === "eraser") {
                ctx.globalCompositeOperation = "destination-out";
            } else {
                ctx.globalCompositeOperation = "source-over";
                ctx.strokeStyle = stroke.color ? stroke.color : "black";
            }
            ctx.lineWidth = stroke.width;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (const point of stroke.points) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
    }

    return (
        <div className="relative h-full w-full">
            <canvas
                ref={canvasRef}
                className="w-full h-full bg-white rounded-2xl"
                style={{
                    cursor: isDrawer ? getCursor(width, color, tool) : "default"
                }}
                onMouseDown={isDrawer ? startDrawing : undefined}
                onMouseMove={isDrawer ? draw : undefined}
                onMouseUp={isDrawer ? stopDrawing : undefined}
                onMouseLeave={isDrawer ? stopDrawing : undefined}
            />

            {/* 3. Embedded the Toolbar perfectly inside the Canvas */}
            {isDrawer && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-max shadow-2xl rounded-2xl">
                    <DrawingToolbar 
                        tool={tool}
                        setTool={setTool}
                        color={color}
                        setColor={setColor}
                        width={width}
                        setWidth={setWidth}
                        undo={undo}
                        redo={redo}
                        clear={clear}
                    />
                </div>
            )}
        </div>
    );
}

function getCursor(width: number, color: string, tool: Tool) {
    const cursorSize = Math.max(14, width * 1.5);
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}">
      <circle cx="${cursorSize / 2}" cy="${cursorSize / 2}" r="${cursorSize / 2 - 3}" fill="white" stroke="${tool === "eraser" ? "black" : color}" stroke-width="2" />
    </svg>
    `;
    return `url("data:image/svg+xml;base64,${btoa(svg)}") ${cursorSize / 2} ${cursorSize / 2}, auto`;
}
"use client";

import { useEffect, useRef, useState } from "react";
import { Tool, Stroke, Point } from "../types";
import { Socket } from "socket.io-client";
import DrawingToolbar from "./DrawingToolbar"; 
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
    const renderQueue = useRef<{from: Point, to: Point, stroke: Stroke}[]>([]);
    const isRendering = useRef(false);

    const drawing = useRef(false);
    const currentStroke = useRef<Stroke | null>(null);
    const lastPoint = useRef({ x:0, y:0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        
        canvas.width = 800; 
        canvas.height = 600;
        
        const ctx = canvas.getContext("2d")!;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, []);

    useEffect(() => {
        socket.on("canvas:state", ({strokes: serverStrokes, undoStrokes: ServerUndoStrokes}: {strokes: Stroke[], undoStrokes: Stroke[]}) => {
            strokes.current = serverStrokes;
            UndoStrokes.current = ServerUndoStrokes;
            redrawCanvas();
            updateHistoryState();
        });

       socket.on("canvas:clear", () => {
            strokes.current = [];
            UndoStrokes.current = [];
            redrawCanvas();
            updateHistoryState();
        });
        
        socket.on("stroke:start", ({stroke}) => {
            strokes.current.push(stroke);
            UndoStrokes.current = [];
            updateHistoryState();
            if (stroke.tool === "fill") {
                if (renderQueue.current.length > 0) {
                    renderQueue.current.forEach(op => drawLine(op.from, op.to, op.stroke));
                    renderQueue.current = [];
                }

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

        socket.on("stroke:update", ({strokeId, points}: {strokeId: string, points: Point[]}) => {
            const stroke = strokes.current.find(s => s.id === strokeId);
            if(!stroke) return;
            
            let lastP = stroke.points[stroke.points.length - 1];
            
            for (const pt of points) {
                if (!lastP) lastP = pt;
                
                stroke.points.push(pt); 
                renderQueue.current.push({ from: lastP, to: pt, stroke });
                
                lastP = pt; 
            }

            if (!isRendering.current) {
                isRendering.current = true;
                requestAnimationFrame(processRenderQueue);
            }
        });

        socket.emit("canvas:request-state", roomId);

        return () => {
            socket.off("stroke:start");
            socket.off("stroke:update");
            socket.off("stroke:undo");
            socket.off("stroke:redo");  
            socket.off("canvas:state");
            socket.off("canvas:clear");
        }
    }, [socket , roomId]);

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

        const pointsToDraw = Math.max(1, Math.ceil(renderQueue.current.length / 3));

        for (let i = 0; i < pointsToDraw; i++) {
            const op = renderQueue.current.shift();
            if (op) {
                drawLine(op.from, op.to, op.stroke);
            }
        }

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
        
        if (tool === "fill") {
            const fillStroke: Stroke = {
                id: crypto.randomUUID(),
                color,
                width,
                tool: "fill",
                points: [point] 
            };
            
            executeFloodFill(ctx, point.x, point.y, color);
            
            strokes.current.push(fillStroke);
            UndoStrokes.current = [];
            updateHistoryState();
            socket.emit("stroke:start", { stroke: fillStroke, roomId });
            
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
        
        if (!throttleTimeout.current) {
            throttleTimeout.current = setTimeout(() => {
                if (pendingPoints.current.length > 0) {
                    socket.emit("stroke:update", { 
                        roomId: roomId, 
                        strokeId: currentStroke.current?.id, 
                        points: pendingPoints.current 
                    });
                    pendingPoints.current = [];
                }
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
            
            if (throttleTimeout.current) {
                clearTimeout(throttleTimeout.current);
                throttleTimeout.current = null;
            }

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
                // Removed the rounded corners to fit inside the hard bezel, 
                // and added touch-none so mobile players don't accidentally scroll the page!
                className="w-full h-full bg-transparent touch-none"
                style={{
                    cursor: isDrawer ? getCursor(width, color, tool) : "crosshair"
                }}
                onMouseDown={isDrawer ? startDrawing : undefined}
                onMouseMove={isDrawer ? draw : undefined}
                onMouseUp={isDrawer ? stopDrawing : undefined}
                onMouseLeave={isDrawer ? stopDrawing : undefined}
            />

            {/* Embedded Toolbar Wrapper (Retro Control Dock) */}
            {isDrawer && (
                <div 
                    className="
                       absolute bottom-6 left-1/2 -translate-x-1/2 z-10 
                        w-max 
                        bg-slate-950 
                        border border-slate-800
                        border-t-2 border-t-cyan-500
                        shadow-[0_10px_40px_rgba(6,182,212,0.25)]
                        rounded-sm
                        p-2
                    "
                >
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
    // Keep this SVG circle, but enforced a thicker 3px stroke to match the retro blocky style!
    const cursorSize = Math.max(14, width * 1.5);
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}">
      <circle cx="${cursorSize / 2}" cy="${cursorSize / 2}" r="${cursorSize / 2 - 3}" fill="white" stroke="${tool === "eraser" ? "black" : color}" stroke-width="3" />
    </svg>
    `;
    return `url("data:image/svg+xml;base64,${btoa(svg)}") ${cursorSize / 2} ${cursorSize / 2}, auto`;
}
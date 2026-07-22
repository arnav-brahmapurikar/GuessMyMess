export type Point = {
    x: number;
    y: number;

}

export type Stroke = {
    id: string;
    tool: "pen" | "eraser" | "fill";
    color: string | null;
    width: number;
    points: Point[];
}

export type Player = {
    id : string ;
    name : string;
    points : number;
    hasDrawn : boolean;
    hasGuessed : boolean;
    pointsThisTurn: number;
}

export type Room = {
    id : string ,
    hostId : string,
    gameState: "lobby" | "choosing" | "drawing" | "results" | "round-start",
    strokes :Stroke[],
    undoStrokes : Stroke[],
    players : Player[],
    currentRound : number ;
    maxRounds : number ;
    roundStart : number;
    correctWord : string;
    timer : number;
    activeTimer? : NodeJS.Timeout | null;
    hintCount: number;
    currentHint?: string;
    hintTimers?: NodeJS.Timeout[];
}
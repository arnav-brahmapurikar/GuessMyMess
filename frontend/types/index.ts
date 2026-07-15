export type Point = {
    x: number;
    y: number;

}

export type Stroke = {
    id: string;
    tool: "pen" | "eraser";
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
}

export type Room = {
    id : string ,
    hostId : string,
    gameState: "lobby" | "choosing" | "drawing" | "results",
    strokes :Stroke[],
    undoStrokes : Stroke[]
    players : Player[]
    currentRound : number ;
    maxRounds : number ;
    roundStart : number;
    correctWord : string;
    timer : number;

}

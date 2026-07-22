export type Point = {
    x: number;
    y: number;

}

export type Stroke = {
    id: string;
    tool: Tool;
    color: string | null;
    width: number;
    points: Point[];
}

export type Tool =
    | "pen"
    | "eraser"
    | "fill";
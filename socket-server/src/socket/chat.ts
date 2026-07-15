import type { DefaultEventsMap, Server, Socket } from "socket.io";
import type { Room } from "../types/index.js";


export function chatHandler(
    io :  Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        socket:Socket,
        rooms : Map<
            string,Room
        >
)  {
    

}
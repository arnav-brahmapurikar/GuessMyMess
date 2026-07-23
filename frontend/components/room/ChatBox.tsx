"use client";

import { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";

type ChatMessage = {
    id: string;
    type: "system" | "chat" | "success" | "info" | "secret" | "warning"; 
    text: string;
    sender?: string;
};

export default function ChatBox({ room, socket }: { room: string; socket: Socket }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;

        const handleSystemMessage = (data: { type: any; message: string }) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Math.random().toString(36).substring(7),
                    type: data.type || "system",
                    text: data.message,
                },
            ]);
        };

        const handleChatMessage = (data: ChatMessage) => {
            setMessages((prev) => [...prev, data]);
        };

        socket.on("system:message", handleSystemMessage);
        socket.on("chat:message", handleChatMessage);

        return () => {
            socket.off("system:message", handleSystemMessage);
            socket.off("chat:message", handleChatMessage);
        };
    }, [socket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        socket.emit("chat:send", room, inputValue.trim());
        setInputValue("");
    };

    return (
        <Card className="h-full rounded-none border-2 border-slate-800 flex flex-col overflow-hidden bg-slate-900 shadow-[4px_4px_0px_#0f172a]">
            
            {/* RETRO HEADER */}
            <CardHeader className="py-4 border-b-2 border-slate-800 bg-slate-950">
                <CardTitle className="text-sm font-mono font-black uppercase tracking-widest text-pink-400 flex items-center gap-2">
                    <span className="w-2 h-4 bg-pink-500 animate-pulse block"></span>
                    CHAT_LOG
                </CardTitle>
            </CardHeader>

            {/* MESSAGES AREA */}
            <CardContent
                ref={scrollRef}
                className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
            >
                {messages.length === 0 && (
                    <div className="text-xs font-mono text-slate-600 text-center uppercase tracking-widest mt-10">
                        AWAITING INCOMING TRANSMISSIONS...
                    </div>
                )}

                {messages.map((msg) => {
                    let styleClass = "text-slate-300 font-mono text-sm"; // Normal chat
                    let prefix = "";

                    // Arcade-style message formatting
                    if (msg.type === "success") {
                        styleClass = "text-emerald-400 bg-emerald-950/40 border border-emerald-900 font-bold p-2 w-full block shadow-[2px_2px_0px_rgba(4,120,87,0.3)] font-mono text-sm uppercase tracking-wide";
                    } else if (msg.type === "secret") {
                        styleClass = "text-yellow-400 bg-yellow-950/40 border border-yellow-900/50 p-2 w-full block font-mono text-sm";
                        prefix = "[SECRET] ";
                    } else if (msg.type === "warning") {
                        styleClass = "text-orange-400 bg-orange-950/40 border border-orange-900/50 p-2 w-full block font-mono text-sm";
                    } else if (msg.type === "info" || msg.type === "system") {
                        styleClass = "text-cyan-400 border border-cyan-900/30 bg-cyan-950/20 p-2 w-full block text-center text-xs font-mono uppercase tracking-widest";
                    }

                    return (
                        <div key={msg.id} className={styleClass}>
                            {msg.sender ? (
                                <span>
                                    <span className="font-bold text-slate-500">{prefix}{msg.sender}: </span>
                                    <span className={msg.type === "success" ? "text-emerald-400" : "text-slate-200"}>
                                        {msg.text}
                                    </span>
                                </span>
                            ) : (
                                <span>{msg.text}</span>
                            )}
                        </div>
                    );
                })}
            </CardContent>

            {/* TERMINAL INPUT */}
            <CardFooter className="p-4 border-t-2 border-slate-800 bg-slate-950">
                <form 
                    onSubmit={handleSendMessage} 
                    className="flex w-full gap-3"
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="ENTER GUESS..."
                        className="
                            flex-1 bg-slate-900 
                            border-2 border-slate-700 
                            focus-visible:border-pink-400 focus-visible:ring-0
                            text-slate-100 font-mono text-sm
                            rounded-none
                            placeholder:text-slate-600
                        "
                        autoComplete="off"
                    />
                    <Button 
                        type="submit" 
                        className="
                            bg-pink-600 hover:bg-pink-500 text-white 
                            font-mono uppercase font-bold tracking-widest
                            rounded-none border-2 border-pink-400
                            shadow-[4px_4px_0px_#831843] hover:shadow-[4px_4px_0px_#831843]
                            active:shadow-[0px_0px_0px_#831843] active:translate-y-1 active:translate-x-1
                            transition-all
                        "
                    >
                        SEND
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
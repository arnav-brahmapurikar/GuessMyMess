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

// 1. Expand the types to match the backend!
type ChatMessage = {
    id: string;
    type: "system" | "chat" | "success" | "info" | "secret"; 
    text: string;
    sender?: string;
};

export default function ChatBox({ room, socket }: { room: string; socket: Socket }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Listen for incoming socket events
    useEffect(() => {
        if (!socket) return;

        // Handler for System Events (Start, Guessed it, Info)
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

        // Handler for Normal & Secret Chats
        const handleChatMessage = (data: ChatMessage) => {
            setMessages((prev) => [...prev, data]);
        };

        // Attach listeners
        socket.on("system:message", handleSystemMessage);
        socket.on("chat:message", handleChatMessage);

        // Cleanup
        return () => {
            socket.off("system:message", handleSystemMessage);
            socket.off("chat:message", handleChatMessage);
        };
    }, [socket]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // FIXED: Pass the room ID along with the message!
        socket.emit("chat:send", room, inputValue.trim());
        
        // FIXED: Clear the input after sending
        setInputValue("");
    };

    return (
        <Card className="h-full rounded-3xl shadow-xl border-4 border-white/70 flex flex-col overflow-hidden bg-white/95">
            <CardHeader className="py-4 border-b">
                <CardTitle className="text-lg font-bold text-gray-800">
                    💬 Chat & Guesses
                </CardTitle>
            </CardHeader>

            <CardContent
                ref={scrollRef}
                className="flex-1 p-4 space-y-2 overflow-y-auto"
            >
                {messages.length === 0 && (
                    <div className="text-sm text-gray-400 text-center italic mt-10">
                        No messages yet. Waiting for players...
                    </div>
                )}

                {messages.map((msg) => {
                    // Dynamic styling based on the message type
                    let styleClass = "text-gray-800"; // Normal chat
                    let prefix = "";

                    if (msg.type === "success") {
                        styleClass = "text-green-700 bg-green-100 font-bold p-1.5 rounded-md w-full block";
                    } else if (msg.type === "secret") {
                        styleClass = "text-yellow-700 bg-yellow-50 border border-yellow-200 italic p-1.5 rounded-md w-full block";
                        prefix = "🤫 [Secret] ";
                    } else if (msg.type === "info" || msg.type === "system") {
                        styleClass = "text-blue-600 bg-blue-50 italic p-1.5 rounded-md w-full block text-center text-xs font-semibold";
                    }

                    return (
                        <div key={msg.id} className={`text-sm ${styleClass}`}>
                            {msg.sender ? (
                                <span>
                                    <span className="font-bold">{prefix}{msg.sender}: </span>
                                    {msg.text}
                                </span>
                            ) : (
                                <span>{msg.text}</span>
                            )}
                        </div>
                    );
                })}
            </CardContent>

            <CardFooter className="p-3 border-t bg-gray-50">
                <form 
                    onSubmit={handleSendMessage} 
                    className="flex w-full gap-2"
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your guess..."
                        className="flex-1 bg-white"
                        autoComplete="off"
                    />
                    <Button type="submit" className="font-bold">
                        Send
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
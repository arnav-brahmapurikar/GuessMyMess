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

// Define the shape of our messages
type ChatMessage = {
    id: string;
    type: "system" | "chat"; // We can expand this later for guesses
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

        // Handler for system messages (joins, leaves, kicks)
        const handleSystemMessage = (data: { type: string; message: string }) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Math.random().toString(36).substring(7), // Quick unique ID
                    type: "system",
                    text: data.message,
                },
            ]);
        };

        socket.on("system:message", handleSystemMessage);

        // Cleanup listener on unmount to prevent duplicate messages
        return () => {
            socket.off("system:message", handleSystemMessage);
        };
    }, [socket]);

    // Auto-scroll to bottom whenever messages update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // For now, just add it locally. 
        // Later, we will emit this to the server so everyone sees it!
        setMessages((prev) => [
            ...prev,
            {
                id: Math.random().toString(36).substring(7),
                type: "chat",
                text: inputValue,
                sender: "You", // Hardcoded for now
            },
        ]);
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

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`text-sm font-medium ${
                            msg.type === "system"
                                ? "text-green-600 italic bg-green-50 p-1.5 rounded-md" // Styling for system alerts
                                : "text-gray-800"
                        }`}
                    >
                        {msg.type === "system" ? (
                            `📢 ${msg.text}`
                        ) : (
                            <span>
                                <span className="font-bold">{msg.sender}: </span>
                                {msg.text}
                            </span>
                        )}
                    </div>
                ))}
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
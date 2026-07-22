"use client";

import { useState } from "react";
import { Room } from "@/types";
import { Socket } from "socket.io-client";
import { Link2 } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function LobbyPanel({
    socket,
    room,
    roomId,
}: {
    socket: Socket;
    room: Room;
    roomId: string;
}) {
    const isHost = socket.id === room.hostId;

    // Local state for UI configuration that doesn't have backend handlers yet
    const [players, setPlayers] = useState("8");
    const [language, setLanguage] = useState("English");
    const [gameMode, setGameMode] = useState("Normal");
    const [wordCount, setWordCount] = useState("3");
    const [hints, setHints] = useState("2");
    const [useCustomWords, setUseCustomWords] = useState(false);
    const [customWords, setCustomWords] = useState("");

    // --- SOCKET HANDLERS ---
    
    const handleStart = () => {
        if (isHost) {
            socket.emit("game:start", roomId);
        }
    };

    const handleTimerChange = (value: string) => {
        if (isHost) {
            // Parse to integer since the Room type expects a number
            socket.emit("lobby:update-timer", roomId, parseInt(value, 10));
        }
    };

    const handleRoundsChange = (value: string) => {
        if (isHost) {
            socket.emit("lobby:update-rounds", roomId, parseInt(value, 10));
        }
    };

    const handleHintCountChange = (value: string) => {
        if (isHost) {
            socket.emit("lobby:update-hintCount", roomId, parseInt(value, 10));
        }
    };

    // -----------------------

    const handleInvite = () => {
        const inviteLink = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(inviteLink);
        alert("Invite link copied to clipboard!");
    };

    const SettingRow = ({ label, icon, value, onChange, options }: any) => (
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-white font-medium text-sm">
                <span className="w-5 h-5 flex items-center justify-center bg-white text-black rounded-sm text-xs border border-gray-300">
                    {icon}
                </span>
                {label}
            </div>
            <Select disabled={!isHost} value={value} onValueChange={onChange}>
                <SelectTrigger className="w-48 h-8 bg-white text-black border-0 rounded-sm focus:ring-0 focus:ring-offset-0 disabled:opacity-70 disabled:cursor-not-allowed">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>
                            {opt}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <div className="w-full max-w-[600px] mx-auto bg-[#2C303E] rounded-md shadow-xl border-2 border-[#1E212A] overflow-hidden font-sans">
            <div className="p-4">
                <SettingRow
                    label="Players"
                    icon="👤"
                    value={players}
                    onChange={setPlayers}
                    options={["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]}
                />
                {/* <SettingRow
                    label="Language"
                    icon="🌐"
                    value={language}
                    onChange={setLanguage}
                    options={["English", "Spanish", "French", "German"]}
                /> */}
                
                {/* Dynamically reading from the room prop and writing via sockets */}
                <SettingRow
                    label="Drawtime"
                    icon="⏱️"
                    value={room.timer?.toString() || "80"}
                    onChange={handleTimerChange}
                    options={["30", "40", "50", "60", "70", "80", "90", "100", "120"]}
                />
                <SettingRow
                    label="Rounds"
                    icon="🔄"
                    value={room.maxRounds?.toString() || "3"}
                    onChange={handleRoundsChange}
                    options={["2", "3", "4", "5", "6", "7", "8", "9", "10"]}
                />

                {/* <SettingRow
                    label="Game Mode"
                    icon="🎮"
                    value={gameMode}
                    onChange={setGameMode}
                    options={["Normal", "Hidden", "Fast"]}
                /> */}
                {/* <SettingRow
                    label="Word Count"
                    icon="📝"
                    value={wordCount}
                    onChange={setWordCount}
                    options={["2", "3", "4", "5"]}
                /> */}
                <SettingRow
                    label="Hints"
                    icon="❓"
                    value={room.hintCount?.toString() || "0"}
                    onChange={handleHintCountChange}
                    options={["0", "1", "2", "3","4","5"]}
                />

                {/* <div className="mt-4 flex justify-between items-end mb-1">
                    <label className="text-white font-bold text-sm">Custom words</label>
                    <div className="flex items-center gap-2 text-white text-sm">
                        <label
                            htmlFor="custom-words-checkbox"
                            className="cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Use custom words only
                        </label>
                        <Checkbox
                            id="custom-words-checkbox"
                            disabled={!isHost}
                            checked={useCustomWords}
                            onCheckedChange={(checked) => setUseCustomWords(checked as boolean)}
                            className="w-4 h-4 bg-white border-none rounded-sm data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                        />
                    </div>
                </div> */}

                {/* <Textarea
                    disabled={!isHost}
                    value={customWords}
                    onChange={(e) => setCustomWords(e.target.value)}
                    placeholder="Minimum of 10 words. 1-32 characters per word! 20000 characters maximum. Separated by a , (comma)"
                    className="w-full h-32 bg-white text-black rounded-sm p-2 text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:bg-gray-300 disabled:opacity-100 disabled:cursor-not-allowed placeholder:text-gray-400"
                /> */}
            </div>

            <div className="flex w-full bg-[#1E212A] p-2 gap-2">
                <Button
                    onClick={handleStart}
                    disabled={!isHost}
                    className={`flex-grow h-12 text-2xl font-extrabold rounded-sm transition-all ${
                        isHost
                            ? "bg-[#56C839] hover:bg-[#4eb333] text-white border-b-[5px] border-[#3e9329] active:border-b-0 active:translate-y-1"
                            : "bg-gray-500 hover:bg-gray-500 text-gray-300 border-b-[5px] border-gray-600 disabled:opacity-100"
                    }`}
                >
                    {isHost ? "Start!" : "Waiting for Host..."}
                </Button>

                <Button
                    onClick={handleInvite}
                    className="w-1/3 h-12 bg-[#2D7AEF] hover:bg-[#2568d2] text-white text-xl font-extrabold rounded-sm flex items-center justify-center gap-2 border-b-[5px] border-[#1e54aa] active:border-b-0 active:translate-y-1 transition-all"
                >
                    <Link2 className="w-5 h-5 font-bold" />
                    Invite
                </Button>
            </div>
        </div>
    );
}
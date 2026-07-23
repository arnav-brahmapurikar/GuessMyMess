"use client";

import { useState } from "react";
import { Room } from "@/types";
import { Socket } from "socket.io-client";
import {
    Link2,
    Settings2,
    Users,
    Clock,
    RotateCw,
    HelpCircle,
    Play,
} from "lucide-react";
import { toast } from "sonner";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

    const [players, setPlayers] = useState("8");

    const handleStart = () => {
        if (isHost) {
            socket.emit("game:start", roomId);
        }
    };

    const handleTimerChange = (value: string) => {
        if (isHost) {
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

    const handleInvite = () => {
        const inviteLink = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(inviteLink);
        toast.success("ROOM INVITE LINK COPIED TO CLIPBOARD");
    };

    const SettingRow = ({ label, icon, value, onChange, options }: any) => (
        <div className="flex items-center justify-between p-3.5 bg-slate-950 border-2 border-slate-800 shadow-[inset_1px_1px_0px_rgba(0,0,0,0.35)] hover:border-cyan-500/30 transition-all duration-200">
            <div className="flex items-center gap-3 text-cyan-400 font-mono font-bold uppercase tracking-widest text-sm drop-shadow-[0_0_3px_rgba(6,182,212,0.18)]">
                <span className="flex items-center justify-center w-6 h-6 bg-slate-900 border border-slate-700 text-cyan-400">
                    {icon}
                </span>
                {label}
            </div>

            <Select disabled={!isHost} value={value} onValueChange={onChange}>
                <SelectTrigger className="w-36 h-9 rounded-none border-2 border-slate-700 bg-slate-900 text-cyan-300 font-mono font-bold focus:ring-0 focus:ring-offset-0 focus:border-cyan-400 focus:shadow-[0_0_4px_rgba(6,182,212,0.22)] disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue />
                </SelectTrigger>

                <SelectContent className="rounded-none border-2 border-slate-800 bg-slate-900 text-cyan-300 font-mono shadow-[2px_2px_0px_#020617]">
                    {options.map((opt: string) => (
                        <SelectItem
                            key={opt}
                            value={opt}
                            className="rounded-none cursor-pointer focus:bg-cyan-500 focus:text-slate-950"
                        >
                            {opt}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <div className="relative mx-auto w-full max-w-[650px] overflow-hidden border-4 border-slate-800 bg-slate-900 font-mono shadow-[4px_4px_0px_#0f172a]">

            {/* subtle scanlines */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.025] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 border-b-2 border-slate-800 bg-slate-950 p-5">
                <Settings2 className="size-6 text-pink-500" />

                <h2
                    className="text-xl font-black uppercase tracking-widest text-slate-100"
                    style={{
                        textShadow:
                            "1px 1px 0px #be185d, 2px 2px 0px #0f172a",
                    }}
                >
                    Lobby_<span className="text-pink-500">Settings</span>
                </h2>
            </div>

            {/* Settings */}
            <div className="relative z-10 space-y-4 p-6">
                <SettingRow
                    label="Players"
                    icon={<Users className="size-3.5" />}
                    value={players}
                    onChange={setPlayers}
                    options={[
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                        "11",
                        "12",
                    ]}
                />

                <SettingRow
                    label="Draw Time"
                    icon={<Clock className="size-3.5" />}
                    value={room.timer?.toString() || "80"}
                    onChange={handleTimerChange}
                    options={[
                        "30",
                        "40",
                        "50",
                        "60",
                        "70",
                        "80",
                        "90",
                        "100",
                        "120",
                    ]}
                />

                <SettingRow
                    label="Rounds"
                    icon={<RotateCw className="size-3.5" />}
                    value={room.maxRounds?.toString() || "3"}
                    onChange={handleRoundsChange}
                    options={[
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                    ]}
                />

                <SettingRow
                    label="Hints"
                    icon={<HelpCircle className="size-3.5" />}
                    value={room.hintCount?.toString() || "0"}
                    onChange={handleHintCountChange}
                    options={["0", "1", "2", "3", "4", "5"]}
                />
            </div>

            {/* Footer */}
            <div className="relative z-10 flex gap-4 border-t-2 border-slate-800 bg-slate-950 p-4">
                <Button
                    onClick={handleStart}
                    disabled={!isHost}
                    className={`flex-1 h-14 rounded-none border-2 text-lg font-black uppercase tracking-widest transition-all
                    ${
                        isHost
                            ? "border-emerald-300 bg-emerald-500 text-slate-950 shadow-[2px_2px_0px_#064e3b] hover:bg-emerald-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            : "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-400 opacity-50"
                    }`}
                >
                    <Play className="mr-2 size-5 fill-current" />
                    {isHost ? "START GAME" : "WAITING FOR HOST..."}
                </Button>

                <Button
                    onClick={handleInvite}
                    title="Copy Invite Link"
                    className="h-14 w-1/3 rounded-none border-2 border-cyan-300 bg-cyan-600 text-base font-black uppercase tracking-widest text-slate-950 shadow-[2px_2px_0px_#164e63] transition-all hover:bg-cyan-500 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                    <Link2 className="mr-2 size-5" />
                    INVITE
                </Button>
            </div>
        </div>
    );
}
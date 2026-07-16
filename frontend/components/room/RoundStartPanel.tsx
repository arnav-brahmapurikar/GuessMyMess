import { Room } from "@/types";

export default function RoundStartPanel({ room }: { room: Room }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200">
            <span className="text-6xl animate-bounce mb-4">🚀</span>
            <h1 className="text-5xl font-black text-gray-800 tracking-tight">
                Round {room.currentRound}
            </h1>
            <p className="text-xl text-gray-500 mt-4">Get ready...</p>
        </div>
    );
}
import {
    Card,
    CardContent
} from "@/components/ui/card";

import {
    Brush,
    Users,
    Zap
} from "lucide-react";

const features = [
    {
        title: "Realtime Canvas",
        icon: Brush,
        description: "Ultra smooth collaborative drawing powered by WebSockets.",
        color: "text-cyan-400",
        shadow: "shadow-[2px_2px_0px_rgba(6,182,212,0.4)]"
    },
    {
        title: "Private Rooms",
        icon: Users,
        description: "Invite friends instantly with secure room codes.",
        color: "text-pink-400",
        shadow: "shadow-[2px_2px_0px_rgba(244,114,182,0.4)]"
    },
    {
        title: "Lightning Fast",
        icon: Zap,
        description: "Low latency gameplay built with Next.js and Socket.IO.",
        color: "text-emerald-400",
        shadow: "shadow-[2px_2px_0px_rgba(52,211,153,0.4)]"
    }
];

export default function FeatureCards() {
    return (
        <div
            className="
                grid
                gap-6
                mt-14
                md:grid-cols-3
            "
        >
            {features.map(feature => {
                const Icon = feature.icon;

                return (
                    <Card
                        key={feature.title}
                        className="
                            bg-slate-900/90
                            border-2
                            border-slate-800
                            rounded-none
                            shadow-[4px_4px_0px_#0f172a]
                            hover:-translate-y-1
                            hover:border-slate-700
                            hover:shadow-[8px_8px_0px_#0f172a]
                            transition-all
                            duration-200
                        "
                    >
                        <CardContent
                            className="
                                p-8
                                text-center
                                space-y-5
                            "
                        >
                            {/* Inset Hardware Box for the Icon */}
                            <div 
                                className={`
                                    mx-auto 
                                    size-14 
                                    bg-slate-950 
                                    border-2 
                                    border-slate-800 
                                    flex 
                                    items-center 
                                    justify-center 
                                    ${feature.shadow}
                                `}
                            >
                                <Icon className={`size-7 ${feature.color}`} />
                            </div>

                            <h3
                                className="
                                    text-base
                                    font-mono
                                    font-bold
                                    uppercase
                                    tracking-widest
                                    text-slate-100
                                "
                            >
                                {feature.title}
                            </h3>

                            <p
                                className="
                                    text-slate-400
                                    text-sm
                                    font-mono
                                    leading-relaxed
                                "
                            >
                                {feature.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
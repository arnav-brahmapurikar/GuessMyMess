"use client"
import Hero from "@/components/landing/Hero";
import LandingCard from "@/components/landing/LandingCards";
import FeatureCards from "@/components/landing/FeatureCards";
import { useSocket } from "@/features/sockets/useSocket";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const socket = useSocket();
  const router = useRouter();

  function createRoom(name: string) {
    socket.emit("room:create", name);
  }

  useEffect(() => {
    const onConnect = () => {
      console.log("Connected:", socket.id);
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
    };
  }, [socket]);

  useEffect(() => {
    const handleRoomState = (room: { id: string }) => {
      router.push(`/room/${room.id}`);
    };

    socket.on("room:state", handleRoomState);

    return () => {
      socket.off("room:state", handleRoomState);
    };
  }, [socket, router]);

  return (
    <main
      className="
        min-h-screen
        bg-slate-950 
        text-slate-100
        selection:bg-cyan-500 selection:text-slate-950
        relative
        overflow-hidden
      "
    >
      {/* 
        Retro Synthwave Grid:
        A sleek cyan glowing grid on a dark slate background 
      */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center'
        }}
      />

      {/* 
        Heavy CRT Monitor Vignette:
        Fades the grid into pure black at the edges to make the center pop
      */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#020617_100%)] z-0 pointer-events-none" />

      <section
        className="
          relative
          z-10
          container
          mx-auto
          px-6
          pt-20
          pb-32
          flex
          flex-col
          items-center
          gap-12
        "
      >
        <Hero />
        <LandingCard roomCreate={createRoom} />
        <FeatureCards />
      </section>
    </main>
  );
}
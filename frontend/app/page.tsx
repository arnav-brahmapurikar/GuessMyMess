"use client"
import Hero from "@/components/landing/Hero";
import LandingCard from "@/components/landing/LandingCards";
import FeatureCards from "@/components/landing/FeatureCards";
import { useSocket } from "@/features/sockets/useSocket";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function HomePage() {

  const socket = useSocket();
  const router = useRouter()

function createRoom(name : string ) {
    socket.emit(
        "room:create",
        3,
        100,
        name
        
    );
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
    // console.log(socket.id)
    socket.on("room:state", ( room ) => {

        router.push(`/room/${room.id}`);

    });

    return () => {
        socket.off("room:created");
    };

}, []);

  return (
    <main
      className="
      min-h-screen
      bg-linear-to-br
      from-sky-500
      via-indigo-600
      to-violet-700
      relative
      overflow-hidden
      "
    >
      {/* Background blobs */}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-20 top-24 size-72 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="absolute bottom-20 right-16 size-96 rounded-full bg-pink-400/20 blur-3xl" />

        <div className="absolute top-1/2 left-1/2 size-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <section
        className="
        relative
        container
        mx-auto
        px-6
        pt-16
        "
      >
        <Hero />

        <LandingCard roomCreate={createRoom} />

        <FeatureCards />
      </section>
    </main>
  );
}
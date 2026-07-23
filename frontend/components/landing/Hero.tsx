export default function Hero() {
  return (
    <section className="text-center space-y-8 mt-8">
      
      <h1
        className="
          text-6xl md:text-8xl
          font-black
          uppercase
          tracking-tighter
          text-slate-100
        "
        style={{
          // Creates a hard, retro 3D text effect using Cyan and deep Slate
          textShadow: "4px 4px 0px #06b6d4, 8px 8px 0px #0f172a" 
        }}
      >
        Guess
        <span 
          className="text-pink-500 mx-3 md:mx-5" 
          style={{ 
            // Swaps the shadow to dark pink for the accent word
            textShadow: "4px 4px 0px #be185d, 8px 8px 0px #0f172a" 
          }}
        >
          My
        </span>
        Mess
      </h1>

      <p
        className="
          font-mono
          text-sm md:text-base
          text-cyan-100/70
          max-w-xl
          mx-auto
          uppercase
          tracking-[0.2em]
          leading-relaxed
        "
      >
        Draw fast. <span className="text-pink-400 font-bold">Guess faster.</span>
        <br className="hidden md:block" />
        <span className="mt-2 block">Compete in chaotic real-time battles.</span>
      </p>

    </section>
  );
}
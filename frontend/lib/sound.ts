// lib/sounds.ts

class SoundManager {
    private sounds: Record<string, HTMLAudioElement> = {};

    constructor() {
        if (typeof window === "undefined") return;
        this.sounds = {
            join: new Audio("/sounds/join.mp3"),
            leave: new Audio("/sounds/leave.mp3"),
            hostChange : new Audio("/sounds/host-change.wav"),
            countdown: new Audio("/sounds/countdown.wav"),
            roundStart: new Audio("/sounds/round-start.wav"),
            drawing: new Audio("/sounds/drawing.wav"),
            correct: new Audio("/sounds/correct.wav"),
            result : new Audio("/sounds/result.wav"),
            gameEnd: new Audio("/sounds/game-end.wav"),
        };

        Object.values(this.sounds).forEach(sound => {
            sound.preload = "auto";
            sound.volume = 0.5;
        });
    }

    play(name: keyof typeof this.sounds) {
        const sound = this.sounds[name];
        if (!sound) return;

        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
    
    stop(name: keyof typeof this.sounds) {
        if (typeof window === "undefined") return;
        const sound = this.sounds[name];
        if (!sound) return;

        sound.pause();
        sound.currentTime = 0;
    }
    stopAll() {
        if (typeof window === "undefined") return;
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }
}

export const soundManager = new SoundManager();
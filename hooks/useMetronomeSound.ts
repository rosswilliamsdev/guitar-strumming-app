import { useRef, useEffect, useCallback } from "react";

export function useMetronomeSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.connect(audioContextRef.current.destination);
        masterGainRef.current.gain.value = 0.5; // Default volume
      }
    };

    // Initialize on first user interaction
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Synthesize metronome sound with pitch variation
  const playMetronomeSound = useCallback((pitch: "normal" | "accent") => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create white noise
    const noiseBuffer = createNoiseBuffer(ctx, 0.03); // 30ms of noise
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // High-pass filter for crispy sound (lower pitch for primary)
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = pitch === "accent" ? 4000 : 2500; // Higher pitch for accent
    highpass.Q.value = 0.5;

    // Additional bandpass for character
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = pitch === "accent" ? 8500 : 7000; // Higher pitch for accent
    bandpass.Q.value = 1;

    // Gain envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(pitch === "accent" ? 0.5 : 0.35, now + 0.002); // Louder for accent
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.025); // 25ms decay

    // Connect the audio graph
    noiseSource.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    // Play
    noiseSource.start(now);
    noiseSource.stop(now + 0.05);
  }, []);

  // Set volume (0 to 1)
  const setVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Play appropriate sound based on beat position
  const playBeat = useCallback(
    (isAccent: boolean) => {
      playMetronomeSound(isAccent ? "accent" : "normal");
    },
    [playMetronomeSound]
  );

  return {
    playBeat,
    setVolume,
  };
}

// Helper function to create white noise buffer
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    channel[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

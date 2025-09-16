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
        masterGainRef.current.gain.value = 0.8; // Higher default volume for audibility
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
  const playMetronomeSound = useCallback(
    (pitch: "normal" | "accent" | "muted") => {
      if (!audioContextRef.current || !masterGainRef.current) return;

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      if (pitch === "muted") {
        // Create a muted strum sound - fuller white noise burst
        const noiseBuffer = createNoiseBuffer(ctx, 0.05); // 50ms of noise for more body
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Very gentle high-pass to keep most frequencies
        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 400; // Much lower cutoff for maximum body
        highpass.Q.value = 0.3;

        // Wide bandpass for full white noise character
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 3500; // Centered on mid-highs
        bandpass.Q.value = 0.3; // Very wide Q for maximum body

        // Percussive envelope with more presence
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(1.2, now + 0.002); // Much louder, quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.025); // Slightly longer decay

        // Connect the audio graph for muted sound
        noiseSource.connect(highpass);
        highpass.connect(bandpass);
        bandpass.connect(gainNode);
        gainNode.connect(masterGainRef.current);

        // Play
        noiseSource.start(now);
        noiseSource.stop(now + 0.035);
      } else {
        // Regular and accent sounds - maximum white noise body
        const noiseBuffer = createNoiseBuffer(ctx, 0.1); // 100ms of noise for maximum body
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Very gentle high-pass to keep all low-mid body
        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = pitch === "accent" ? 300 : 200; // Even lower frequencies for maximum body
        highpass.Q.value = 0.2;

        // Very wide bandpass for full spectrum
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = pitch === "accent" ? 2500 : 2000; // Full mid-range presence
        bandpass.Q.value = 0.2; // Very wide Q for maximum body

        // Louder gain envelope with more sustain
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(
          pitch === "accent" ? 1.6 : 1.4,
          now + 0.013
        ); // Much louder with 15ms attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.135); // Extended decay to 135ms

        // Connect the audio graph
        noiseSource.connect(highpass);
        highpass.connect(bandpass);
        bandpass.connect(gainNode);
        gainNode.connect(masterGainRef.current);

        // Play white noise
        noiseSource.start(now);
        noiseSource.stop(now + 0.145);

        // Add sine wave tone for accent beats
        if (pitch === "accent") {
          const oscillator = ctx.createOscillator();
          oscillator.type = "sine";
          oscillator.frequency.value = 600; // Lower frequency for more body

          // Envelope for the sine wave
          const sineGain = ctx.createGain();
          sineGain.gain.setValueAtTime(0, now);
          sineGain.gain.linearRampToValueAtTime(0.9, now + 0.003); // Louder with longer attack
          sineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07); // Longer decay for body

          // Connect sine wave
          oscillator.connect(sineGain);
          sineGain.connect(masterGainRef.current);

          // Play sine wave
          oscillator.start(now);
          oscillator.stop(now + 0.08);
        }
      }
    },
    []
  );

  // Set volume (0 to 1)
  const setVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Play appropriate sound based on beat type
  const playBeat = useCallback(
    (beatType: "normal" | "accent" | "muted" | "rest") => {
      if (beatType === "rest") return; // No sound for rest

      if (beatType === "muted") {
        playMetronomeSound("muted");
      } else {
        playMetronomeSound(beatType === "accent" ? "accent" : "normal");
      }
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

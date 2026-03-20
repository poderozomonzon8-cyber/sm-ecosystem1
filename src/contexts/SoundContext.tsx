import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";

/* ═══════════════════════════════════════════════════════
   AMBIENT SOUND SYSTEM
   Per-theme ambient audio with smooth fade in/out,
   mobile auto-mute, and admin-controllable volume.
   ═══════════════════════════════════════════════════════ */

/* Default ambient sound URLs per theme (can be overridden via admin) */
const DEFAULT_SOUND_BY_PRESET: Record<string, string> = {
  "hardscape-landscape":     "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1a745e3960.mp3",
  "construction-renovation": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1a745e3960.mp3",
  "maintenance-service":     "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1a745e3960.mp3",
};

type SoundContextType = {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  play: () => void;
  pause: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
};

const SoundCtx = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const { themeSettings, activePresetId } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(themeSettings.soundVolume);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  /* Resolve sound URL */
  const getSoundUrl = useCallback(() => {
    if (themeSettings.soundUrl) return themeSettings.soundUrl;
    if (activePresetId && DEFAULT_SOUND_BY_PRESET[activePresetId]) {
      return DEFAULT_SOUND_BY_PRESET[activePresetId];
    }
    return "";
  }, [themeSettings.soundUrl, activePresetId]);

  /* Create / update audio element */
  useEffect(() => {
    const url = getSoundUrl();
    if (!url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0;
    }
    if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [getSoundUrl, isMuted, volume]);

  /* Auto-enable sound based on settings */
  useEffect(() => {
    const shouldPlay = themeSettings.soundEnabled && !(isMobile && themeSettings.soundAutoMuteOnMobile);
    if (shouldPlay) {
      const url = getSoundUrl();
      if (!url) return;
      play();
    } else {
      pause();
    }
  }, [themeSettings.soundEnabled, themeSettings.soundAutoMuteOnMobile]);

  /* Volume sync */
  useEffect(() => {
    setVolumeState(themeSettings.soundVolume);
    if (audioRef.current && !isMuted) audioRef.current.volume = themeSettings.soundVolume;
  }, [themeSettings.soundVolume, isMuted]);

  const fadeTo = useCallback((targetVol: number, durationMs: number, onDone?: () => void) => {
    if (!audioRef.current) return;
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    const startVol = audioRef.current.volume;
    const steps = Math.max(20, Math.floor(durationMs / 50));
    const delta = (targetVol - startVol) / steps;
    let step = 0;
    fadeTimerRef.current = window.setInterval(() => {
      if (!audioRef.current) return;
      step++;
      const next = Math.min(1, Math.max(0, audioRef.current.volume + delta));
      audioRef.current.volume = next;
      if (step >= steps) {
        clearInterval(fadeTimerRef.current!);
        audioRef.current.volume = targetVol;
        onDone?.();
      }
    }, 50);
  }, []);

  const play = useCallback(() => {
    if (!audioRef.current || !getSoundUrl()) return;
    audioRef.current.volume = 0;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      fadeTo(isMuted ? 0 : volume, themeSettings.soundFadeIn);
    }).catch(() => {/* autoplay blocked */});
  }, [fadeTo, isMuted, volume, themeSettings.soundFadeIn, getSoundUrl]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    fadeTo(0, themeSettings.soundFadeOut, () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });
  }, [fadeTo, themeSettings.soundFadeOut]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      fadeTo(volume, 600);
    } else {
      setIsMuted(true);
      fadeTo(0, 400);
    }
  }, [isMuted, volume, fadeTo]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current && !isMuted) audioRef.current.volume = v;
  }, [isMuted]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  return (
    <SoundCtx.Provider value={{ isPlaying, isMuted, volume, play, pause, toggleMute, setVolume }}>
      {children}
    </SoundCtx.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundCtx);
  if (!ctx) throw new Error("useSound must be used inside SoundProvider");
  return ctx;
}

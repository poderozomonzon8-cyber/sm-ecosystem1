import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

/* Per-theme ambient sound URLs (royalty-free placeholder URLs) */
const THEME_SOUNDS: Record<string, { src: string; label: string }> = {
  "hardscape-landscape":     { src: "", label: "Outdoor wind · Gravel texture" },
  "construction-renovation": { src: "", label: "Cinematic hum · Metallic resonance" },
  "maintenance-service":     { src: "", label: "Clean air ambience · Soft room tone" },
};

export default function AmbientSoundManager() {
  const { activePresetId, liveTheme } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [visible, setVisible] = useState(false);

  const soundEnabled = liveTheme["--theme-sound-enabled"] === "1";
  const volume       = parseFloat(liveTheme["--theme-sound-volume"]           ?? "0.3");
  const fadeDur      = parseInt(liveTheme["--theme-sound-fade-duration"]      ?? "2000", 10);
  const autoMuteMob  = liveTheme["--theme-sound-auto-mute-mobile"]            !== "0";

  const soundData = activePresetId ? THEME_SOUNDS[activePresetId] : null;

  /* Auto-mute on mobile if configured */
  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (autoMuteMob && isMobile) setMuted(true);
  }, [autoMuteMob]);

  /* Show the widget only when sound feature is enabled for this theme + there's a src */
  useEffect(() => {
    setVisible(soundEnabled && !!soundData?.src);
  }, [soundEnabled, soundData]);

  /* Manage audio element lifecycle */
  useEffect(() => {
    if (!soundData?.src || !soundEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }
    if (!audioRef.current || audioRef.current.src !== soundData.src) {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(soundData.src);
      audio.loop   = true;
      audio.volume = 0;
      audioRef.current = audio;
    }
  }, [soundData, soundEnabled]);

  /* Fade in/out on mute toggle */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!muted) {
      audio.play().catch(() => {});
      let v = 0;
      const step = volume / (fadeDur / 50);
      const timer = setInterval(() => {
        v = Math.min(v + step, volume);
        audio.volume = v;
        if (v >= volume) clearInterval(timer);
      }, 50);
      return () => clearInterval(timer);
    } else {
      let v = audio.volume;
      const step = v / (fadeDur / 50);
      const timer = setInterval(() => {
        v = Math.max(v - step, 0);
        audio.volume = v;
        if (v <= 0) { audio.pause(); clearInterval(timer); }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [muted, volume, fadeDur]);

  if (!visible) return null;

  return (
    <button
      onClick={() => setMuted(m => !m)}
      className="fixed bottom-24 right-5 z-40 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2"
      style={{
        background: "var(--theme-header-bg, hsl(220,22%,8%))",
        border: "1px solid var(--theme-header-border, rgba(255,255,255,0.08))",
        color: "var(--theme-accent, hsl(42,90%,52%))",
        boxShadow: "var(--theme-shadow-md, 0 4px 20px rgba(0,0,0,0.2))",
      }}
      title={muted ? `Play ambient sound — ${soundData?.label}` : "Mute ambient sound"}
      aria-label={muted ? "Unmute ambient sound" : "Mute ambient sound"}
    >
      {muted
        ? <SpeakerSlash size={15} weight="fill" />
        : <SpeakerHigh  size={15} weight="fill" />
      }
    </button>
  );
}

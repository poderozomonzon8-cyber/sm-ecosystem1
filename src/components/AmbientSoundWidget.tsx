import { useState } from "react";
import { SpeakerHigh, SpeakerSlash, SpeakerNone, SpeakerLow } from "@phosphor-icons/react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSound } from "@/contexts/SoundContext";

/* ═══════════════════════════════════════════════════════
   AMBIENT SOUND WIDGET
   Minimal floating control for sound on/off + volume
   Only renders when sound is enabled for the active theme
   ═══════════════════════════════════════════════════════ */
export default function AmbientSoundWidget() {
  const { themeSettings, setThemeSetting, isNightMode } = useTheme();
  const { isPlaying, isMuted, volume, toggleMute, setVolume, play, pause } = useSound();
  const [expanded, setExpanded] = useState(false);

  if (!themeSettings.soundEnabled) return null;

  const handleToggle = () => {
    if (isPlaying) pause();
    else play();
  };

  const VolumeIcon = isMuted || volume === 0
    ? SpeakerNone
    : volume < 0.4
    ? SpeakerLow
    : SpeakerHigh;

  if (isMuted) {
    return null; // SpeakerSlash shown as mute
  }

  return (
    <div
      className={`fixed bottom-6 left-6 z-[60] flex items-center gap-2 transition-all duration-500 ${isNightMode ? "opacity-70" : "opacity-90"}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <button
        onClick={handleToggle}
        className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 focus:outline-none"
        style={{
          background: "var(--theme-card-bg, rgba(255,255,255,0.08))",
          borderColor: "var(--theme-card-border, rgba(255,255,255,0.1))",
          backdropFilter: "blur(12px)",
          color: "var(--theme-accent)",
        }}
        aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
        title={isPlaying ? "Pause ambient" : "Play ambient sound"}
      >
        {isPlaying
          ? <VolumeIcon size={14} weight="fill" />
          : <SpeakerSlash size={14} weight="fill" />
        }
      </button>

      {/* Expand to show volume slider */}
      <div className={`overflow-hidden transition-all duration-400 ${expanded && isPlaying ? "w-24 opacity-100" : "w-0 opacity-0"}`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={e => {
            setVolume(parseFloat(e.target.value));
            setThemeSetting("soundVolume", parseFloat(e.target.value));
          }}
          className="w-20 h-1 accent-[var(--theme-accent)]"
          aria-label="Sound volume"
        />
      </div>
    </div>
  );
}

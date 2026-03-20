import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnimation } from "@/contexts/AnimationContext";

/**
 * ThemeAnimationBridge
 * A renderless component that keeps the AnimationContext in sync with the
 * active ThemeContext preset. Place it once inside both providers (see index.tsx).
 * Does NOT modify any existing functionality.
 */
export function ThemeAnimationBridge() {
  const { activePresetId } = useTheme();
  const { setPresetId } = useAnimation();

  useEffect(() => {
    setPresetId(activePresetId);
  }, [activePresetId, setPresetId]);

  return null;
}

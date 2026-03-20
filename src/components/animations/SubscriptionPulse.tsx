import { useAnimation } from "@/contexts/AnimationContext";

/* ═══════════════════════════════════════════════════════════
   SubscriptionPulse wrapper — Maintenance / Service Plans only
   Wraps a subscription / plan card and adds
   a continuous highlight pulse animation.
   ═══════════════════════════════════════════════════════════ */

export function SubscriptionPulse({
  children,
  active = false,
  className = "",
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  const { activeAnimSet } = useAnimation();
  const duration = activeAnimSet?.pulseDuration ?? 3200;
  const isMaintenanceTheme = !!activeAnimSet && activeAnimSet.presetId === "maintenance-service";

  return (
    <div
      className={`relative ${className}`}
      style={isMaintenanceTheme && active ? {
        animation: `subscription-pulse ${duration}ms cubic-bezier(0.4,0,0.6,1) infinite`,
      } : undefined}
    >
      {children}
      {/* Pulse ring overlay */}
      {isMaintenanceTheme && active && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            boxShadow: `0 0 0 0 var(--theme-accent, hsl(205,70%,54%))`,
            animation: `subscription-pulse-ring ${duration}ms ease-in-out infinite`,
          }}
        />
      )}
    </div>
  );
}

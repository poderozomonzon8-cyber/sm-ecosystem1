import { Gear } from "@phosphor-icons/react";

interface PlaceholderPanelProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  height?: string;
}

export default function PlaceholderPanel({
  title = "Module Placeholder",
  description = "This section is ready for content and development.",
  icon,
  height = "h-64",
}: PlaceholderPanelProps) {
  return (
    <div className={`${height} flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center p-8`}>
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        {icon ?? <Gear size={22} weight="regular" className="text-gray-400" />}
      </div>
      <p className="font-headline font-semibold text-sm text-charcoal mb-1">{title}</p>
      <p className="font-sans text-xs text-gray-400 max-w-xs">{description}</p>
    </div>
  );
}

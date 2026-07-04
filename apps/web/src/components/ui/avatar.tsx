import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-2xl",
} as const;

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover", SIZE_CLASSES[size], className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-elevated font-display font-bold text-cyan",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

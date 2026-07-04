import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-cyan focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-royal text-on-accent hover:shadow-[var(--glow-royal)] active:brightness-95",
        secondary:
          "glass text-primary hover:border-royal/50",
        ghost: "text-secondary hover:text-primary hover:bg-elevated/50",
        gold: "bg-gold text-abyss font-semibold hover:shadow-[var(--glow-gold)]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

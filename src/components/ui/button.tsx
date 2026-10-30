import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        landing: "",
        default: "btn-gel-aqua shadow-aqua-sm hover:shadow-aqua-md",
        destructive: "rounded-full bg-gradient-to-b from-rose-400 to-rose-600 text-white font-bold shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),0_8px_20px_rgba(225,29,72,0.35)] hover:brightness-105",
        outline: "rounded-full border-2 border-primary/60 bg-white/70 text-primary hover:bg-primary hover:text-white backdrop-blur-md shadow-[0_4px_12px_rgba(38,198,218,0.12)] hover:shadow-aqua-sm transition-all",
        secondary: "btn-gel-white border border-[#c7dee1]",
        ghost: "rounded-full text-foreground hover:bg-white/80 hover:text-primary backdrop-blur-sm transition-colors",
        link: "text-primary underline-offset-4 hover:underline font-medium",
        hero: "btn-gel-aqua shadow-aqua-md hover:shadow-aqua-lg min-h-[48px] text-base",
        heroOutline: "rounded-full border-2 border-white/80 bg-white/30 text-white hover:bg-white/50 backdrop-blur-md shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.9),0_6px_16px_rgba(0,0,0,0.1)] font-bold",
        accent: "btn-gel-green shadow-[inset_0_2px_3px_rgba(255,255,255,0.65),0_8px_20px_rgba(102,187,106,0.35)]",
        success: "btn-gel-green shadow-[inset_0_2px_3px_rgba(255,255,255,0.65),0_8px_20px_rgba(102,187,106,0.35)]",
      },
      size: {
        landing: "h-auto whitespace-normal",
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

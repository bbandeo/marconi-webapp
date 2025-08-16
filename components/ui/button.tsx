import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-body-md font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vibrant-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-lg",
  {
    variants: {
      variant: {
        // PRIMARIO - Naranja Vibrante con texto Blanco Hueso
        default: "bg-vibrant-orange text-bone-white hover:bg-vibrant-orange/90 hover:shadow-xl transform hover:-translate-y-0.5",
        
        // SECUNDARIO - Transparente con borde gris sutil
        outline: "border border-support-gray/40 bg-transparent text-bone-white hover:bg-support-gray/10 hover:border-support-gray/60 backdrop-blur-sm",
        
        // DESTRUCTIVO - Mantenemos para alertas
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        // SECUNDARIO ALTERNATIVO - Para casos especiales
        secondary: "bg-night-blue/60 text-bone-white border border-support-gray/20 hover:bg-night-blue/80 backdrop-blur-sm",
        
        // GHOST - Para acciones sutiles
        ghost: "text-bone-white hover:bg-support-gray/10 hover:text-vibrant-orange",
        
        // LINK - Para navegación
        link: "text-vibrant-orange underline-offset-4 hover:underline hover:text-vibrant-orange/80",
      },
      size: {
        sm: "h-9 rounded-lg px-4 text-body-sm",
        default: "h-12 px-6 py-3",
        lg: "h-14 rounded-xl px-8 text-body-lg",
        xl: "h-16 rounded-2xl px-12 text-heading-sm", // Para CTAs principales
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

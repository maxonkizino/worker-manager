import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/css"

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-white shadow-xs hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
                outline:
                    "text-foreground border-border bg-background hover:bg-accent hover:text-accent-foreground",
                success:
                    "border-transparent bg-green-500 text-white shadow-xs hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
            },
            size: {
                sm: "px-2 py-0.5 text-xs",
                default: "px-2.5 py-0.5 text-xs",
                lg: "px-3 py-1 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Badge({
                   className,
                   variant,
                   size,
                   ...props
               }: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
    return (
        <div
            data-slot="badge"
            className={cn(badgeVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
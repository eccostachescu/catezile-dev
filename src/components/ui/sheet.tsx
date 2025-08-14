import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple implementation without Radix for now
interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right' | 'top' | 'bottom'
}

const Sheet = ({ children }: SheetProps) => {
  return <>{children}</>
}

const SheetTrigger = ({ children, asChild, ...props }: { children: React.ReactNode, asChild?: boolean } & React.HTMLAttributes<HTMLElement>) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props)
  }
  return <button {...props}>{children}</button>
}

const SheetContent = ({ side = "right", className, children, ...props }: SheetContentProps) => {
  return (
    <div
      className={cn(
        "fixed inset-y-0 z-50 w-80 bg-cz-bg border-cz-border p-6 shadow-lg transition-transform duration-300",
        side === "right" && "right-0 border-l",
        side === "left" && "left-0 border-r",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
}
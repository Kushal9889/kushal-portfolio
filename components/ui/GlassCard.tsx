import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export function GlassCard({ children, className, hover = true, glow = false }: GlassCardProps) {
  return (
    <div 
      className={cn(
        // Enhanced Glass Base Styles
        'relative overflow-hidden rounded-2xl bg-glass-bg backdrop-blur-xl border border-glass-border p-6',
        // Enhanced Hover Effects
        hover && 'transition-all duration-500 hover:scale-[1.02] hover:border-accent-primary/30 hover:bg-glass-hover hover:shadow-glass-hover',
        // Optional Glow Effect
        glow && 'shadow-glow hover:shadow-glow-lg',
        className
      )}
    >
      {/* Top Border Highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] [background-size:20px_20px]" />
      </div>
    </div>
  )
}
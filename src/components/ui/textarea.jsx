import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full min-h-[140px] rounded-lg bg-transparent border border-border px-4 py-3 text-sm text-text placeholder:text-text-secondary/60 outline-none transition-all duration-300 focus:border-gold focus:shadow-[0_0_0_3px_rgb(var(--gold)/0.15)]',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
export { Textarea }

import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-btn-bg text-btn-text hover:brightness-110 shadow-[0_0_0_0_rgba(212,175,55,0)] hover:shadow-[0_8px_30px_-5px_rgb(var(--gold)/0.5)]',
        outline: 'border border-border bg-transparent text-text hover:border-gold hover:text-gold',
        ghost: 'bg-transparent text-text hover:bg-gold/10',
        gold: 'bg-gold text-black hover:bg-gold-hover',
      },
      size: {
        default: 'h-12 px-7',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }

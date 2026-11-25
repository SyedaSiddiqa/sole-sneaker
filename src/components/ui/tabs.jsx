import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex items-center gap-1 rounded-full border border-border p-1', className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'rounded-full px-5 py-2 text-sm font-medium text-text-secondary transition-all data-[state=active]:bg-gold data-[state=active]:text-black',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn('mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500', className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

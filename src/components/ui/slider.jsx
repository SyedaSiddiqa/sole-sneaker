import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

function Slider({ className, ...props }) {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-gold/20">
        <SliderPrimitive.Range className="absolute h-full bg-gold" />
      </SliderPrimitive.Track>
      {props.value?.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-4 w-4 rounded-full border-2 border-gold bg-card-solid shadow transition-transform hover:scale-125 focus-visible:outline-none"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }

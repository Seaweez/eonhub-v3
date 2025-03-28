import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/styling'

const buttonVariants = cva(
  cn(
    `relative`,
    `inline-flex items-center justify-center font-semibold ring-offset-background transition-colors rounded-full`,
    `focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring`,
    `disabled:pointer-events-none disabled:opacity-50`,
    `transition-opacity duration-300 hover:opacity-75`,
  ),
  {
    variants: {
      variant: {
        default: cn(
          `bg-primary text-white border-4 border-border shadow`,
          `before:rounded-full before:absolute before:-inset-[9px] before:border before:border-border before:-z-10`,
        ),
        'wallet-danger': cn(
          `bg-red-500 text-white border-4 border-red-100 shadow-danger`,
          `before:rounded-full before:absolute before:-inset-[9px] before:border before:border-red-100 before:-z-10`,
        ),
        'wallet-connected': cn(`bg-white shadow`),
        light: cn(`bg-white text-foreground`),
        'primary-outline': cn(`bg-primary border-4 shadow border-white text-white`),
      },
      size: {
        default: cn(`h-14 px-6 py-2`),
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export default Button

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ' +
    'transition-[background,color,border,transform] duration-150 ease-out ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)] ' +
    'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.985] ' +
    "[&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-ink-2)]',
        accent: 'bg-[var(--color-accent)] text-[var(--color-paper)] hover:bg-[var(--color-accent-deep)]',
        ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]',
        outline: 'border border-[var(--color-rule-2)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] hover:border-[var(--color-ink)]',
        link: 'bg-transparent text-[var(--color-ink)] underline-offset-4 hover:underline px-0',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-[var(--radius-sm)] [&_svg]:size-3.5',
        md: 'h-10 px-4 text-sm rounded-[var(--radius-md)] [&_svg]:size-4',
        lg: 'h-12 px-6 text-[15px] rounded-[var(--radius-md)] [&_svg]:size-[18px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };

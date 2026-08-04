import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-btn font-heading font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-ala-red text-white hover:bg-ala-red-dark shadow-soft',
        navy: 'bg-ala-navy text-white hover:bg-ala-navy-soft',
        outline: 'border-2 border-white text-white hover:bg-white hover:text-ala-navy',
        'outline-navy': 'border-2 border-ala-navy text-ala-navy hover:bg-ala-navy hover:text-white',
        ghost: 'text-ala-navy hover:bg-ala-grey-50',
        link: 'text-ala-red underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-[0.95rem]',
        lg: 'h-13 px-8 py-3.5 text-base',
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = 'Button';
export { buttonVariants };

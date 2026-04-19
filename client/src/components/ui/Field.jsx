import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const baseFieldClass =
  'w-full rounded-sm border border-border-subtle bg-bg-elevated px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input ref={ref} className={cn(baseFieldClass, className)} {...props} />
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, rows = 5, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(baseFieldClass, 'min-h-28', className)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select ref={ref} className={cn(baseFieldClass, className)} {...props}>
      {children}
    </select>
  );
});

export const Checkbox = forwardRef(function Checkbox(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded-[4px] border-border-strong bg-bg-elevated text-accent-primary focus:ring-accent-primary/30',
        className
      )}
      {...props}
    />
  );
});

import { cn } from '../../lib/utils';

export default function Tag({ className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary',
        className
      )}
    >
      {children}
    </span>
  );
}

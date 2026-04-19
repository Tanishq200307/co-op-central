import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export default function Dropdown({ trigger, align = 'right', children }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <div onClick={() => setOpen((current) => !current)}>{trigger}</div>
      {open ? (
        <div
          className={cn(
            'absolute top-full z-40 mt-2 min-w-52 rounded-md border border-border-subtle bg-bg-surface p-2 shadow-popover',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({ className, children, ...props }) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary',
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

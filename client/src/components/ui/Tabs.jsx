import { cn } from '../../lib/utils';

export default function Tabs({ tabs = [], value, onChange, className }) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-2 rounded-md border border-border-subtle bg-bg-surface p-1.5',
        className
      )}
    >
      {tabs.map((tab) => {
        const active = value === tab.value;

        return (
          <button
            className={cn(
              'rounded-sm px-4 py-2 text-sm font-medium transition',
              active
                ? 'bg-bg-elevated text-text-primary shadow-card'
                : 'text-text-muted hover:text-text-primary'
            )}
            key={tab.value}
            onClick={() => onChange?.(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

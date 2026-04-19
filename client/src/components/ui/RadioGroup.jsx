import { cn } from '../../lib/utils';

export default function RadioGroup({
  className,
  options,
  name,
  value,
  onChange,
}) {
  return (
    <div
      className={cn('grid gap-2', className)}
      role="radiogroup"
      aria-label={name}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex cursor-pointer items-center justify-between rounded-sm border px-4 py-3 transition',
            value === option.value
              ? 'border-accent-primary bg-accent-primary/10'
              : 'border-border-subtle bg-bg-elevated hover:border-border-strong'
          )}
        >
          <div>
            <p className="text-sm font-medium text-text-primary">
              {option.label}
            </p>
            {option.description ? (
              <p className="text-sm text-text-muted">{option.description}</p>
            ) : null}
          </div>

          <input
            checked={value === option.value}
            className="h-4 w-4 accent-accent-primary"
            name={name}
            onChange={() => onChange(option.value)}
            type="radio"
            value={option.value}
          />
        </label>
      ))}
    </div>
  );
}

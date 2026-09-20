import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...rest }, ref): ReactNode => {
    const classes = [
      'w-48',
      'appearance-none',
      'rounded-invitation-sm',
      'bg-surface-dark',
      'px-4',
      'py-2',
      'pr-12',
      'font-sans',
      'text-text-on-dark',
      'focus-visible:outline',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-text-on-dark',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
    ];
    if (className !== undefined) {
      classes.push(className);
    }

    return (
      <span className="relative inline-block">
        <select ref={ref} className={classes.join(' ')} {...rest}>
          {children}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-9 h-4 w-px -translate-y-1/2 bg-text-on-dark/40"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-on-dark"
        >
          <path
            d="M5 7l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  },
);

Select.displayName = 'Select';

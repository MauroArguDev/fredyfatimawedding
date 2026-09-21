import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'dark';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingLabel?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-surface-sage text-text-on-sage',
  secondary: 'border border-text-body bg-transparent text-text-body',
  dark: 'bg-surface-dark text-text-on-dark',
};

export const Button = ({
  variant = 'primary',
  isLoading = false,
  loadingLabel,
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps): ReactNode => {
  const classes = [
    'rounded-invitation-sm',
    'px-6',
    'py-3',
    'font-sans',
    'font-bold',
    'transition-opacity',
    'focus-visible:outline',
    'focus-visible:outline-2',
    'focus-visible:outline-offset-2',
    'focus-visible:outline-text-body',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    VARIANT_CLASSES[variant],
  ];
  if (className !== undefined) {
    classes.push(className);
  }

  return (
    <button
      type={type}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      className={classes.join(' ')}
      {...rest}
    >
      {isLoading && loadingLabel !== undefined ? loadingLabel : children}
    </button>
  );
};

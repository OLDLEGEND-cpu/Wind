'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-wind-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            'h-11 w-full rounded-xl border border-wind-border bg-wind-surface px-3.5 text-sm text-wind-text placeholder:text-wind-muted transition-colors focus:outline-none focus:border-wind-accent focus:ring-2 focus:ring-wind-accent/20',
            error && 'border-wind-danger focus:border-wind-danger focus:ring-wind-danger/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-wind-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;

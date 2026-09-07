'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          'w-full resize-none rounded-xl border border-wind-border bg-wind-surface px-3.5 py-2.5 text-sm text-wind-text placeholder:text-wind-muted transition-colors focus:outline-none focus:border-wind-accent focus:ring-2 focus:ring-wind-accent/20',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export default Textarea;

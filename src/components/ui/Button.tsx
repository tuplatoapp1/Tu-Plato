import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  onClick?: any;
  disabled?: boolean;
  type?: any;
  title?: string;
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
        {
          'bg-tuplato text-white hover:bg-tuplato-dark hover:shadow-lg hover:shadow-tuplato/20 focus-visible:ring-tuplato': variant === 'primary',
          'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm': variant === 'secondary',
          'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 focus-visible:ring-red-600 border border-transparent': variant === 'danger',
          'hover:bg-gray-100 text-gray-600 hover:text-gray-900': variant === 'ghost',
          'h-9 px-4 text-xs uppercase tracking-wider': size === 'sm',
          'h-11 px-6 text-sm': size === 'md',
          'h-14 px-8 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}

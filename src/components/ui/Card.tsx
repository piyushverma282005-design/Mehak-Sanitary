import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  bordered = true,
}) => {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden transition-all duration-300 ${
        bordered ? 'border border-slate-200/80' : ''
      } ${
        hoverEffect
          ? 'hover:shadow-lg hover:border-slate-300 hover:-translate-y-1'
          : 'shadow-xs'
      } ${className}`}
    >
      {children}
    </div>
  );
};

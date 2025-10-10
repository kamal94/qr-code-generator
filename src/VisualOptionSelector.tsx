import React from 'react';

interface VisualOption<T> {
  value: T;
  label: string;
  icon: React.ReactNode;
}

interface VisualOptionSelectorProps<T> {
  label: string;
  options: VisualOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function VisualOptionSelector<T extends string>({ 
  label, 
  options, 
  value, 
  onChange 
}: VisualOptionSelectorProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-[#555]">{label}</label>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))' }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              relative p-2 rounded-md border-2 transition-all duration-200
              flex flex-col items-center gap-1 cursor-pointer
              ${value === option.value 
                ? 'border-[#007bff] bg-[#e7f3ff] shadow-sm' 
                : 'border-[#ddd] bg-white hover:border-[#999] hover:shadow-sm'
              }
            `}
            title={option.label}
          >
            <div className="w-full h-8 flex items-center justify-center">
              {option.icon}
            </div>
            <span className="text-[10px] text-[#555] text-center font-medium leading-tight">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Dot Shape Icons
export const DotShapeIcons = {
  square: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="10" y="10" width="10" height="10" fill="currentColor" />
      <rect x="25" y="10" width="10" height="10" fill="currentColor" />
      <rect x="40" y="10" width="10" height="10" fill="currentColor" />
      <rect x="10" y="25" width="10" height="10" fill="currentColor" />
      <rect x="25" y="25" width="10" height="10" fill="currentColor" />
      <rect x="40" y="25" width="10" height="10" fill="currentColor" />
      <rect x="10" y="40" width="10" height="10" fill="currentColor" />
      <rect x="25" y="40" width="10" height="10" fill="currentColor" />
      <rect x="40" y="40" width="10" height="10" fill="currentColor" />
    </svg>
  ),
  dots: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <circle cx="15" cy="15" r="5" fill="currentColor" />
      <circle cx="30" cy="15" r="5" fill="currentColor" />
      <circle cx="45" cy="15" r="5" fill="currentColor" />
      <circle cx="15" cy="30" r="5" fill="currentColor" />
      <circle cx="30" cy="30" r="5" fill="currentColor" />
      <circle cx="45" cy="30" r="5" fill="currentColor" />
      <circle cx="15" cy="45" r="5" fill="currentColor" />
      <circle cx="30" cy="45" r="5" fill="currentColor" />
      <circle cx="45" cy="45" r="5" fill="currentColor" />
    </svg>
  ),
  rounded: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="10" y="10" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="25" y="10" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="40" y="10" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="10" y="25" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="25" y="25" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="40" y="25" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="10" y="40" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="25" y="40" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="40" y="40" width="10" height="10" rx="3" fill="currentColor" />
    </svg>
  ),
  'extra-rounded': (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="10" y="10" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="25" y="10" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="40" y="10" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="10" y="25" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="25" y="25" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="40" y="25" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="10" y="40" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="25" y="40" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="40" y="40" width="10" height="10" rx="5" fill="currentColor" />
    </svg>
  ),
  classy: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="10" y="10" width="10" height="10" rx="0" ry="0" fill="currentColor" />
      <rect x="25" y="10" width="10" height="10" rx="5" ry="0" fill="currentColor" />
      <rect x="40" y="10" width="10" height="10" rx="0" ry="5" fill="currentColor" />
      <rect x="10" y="25" width="10" height="10" rx="0" ry="5" fill="currentColor" />
      <rect x="25" y="25" width="10" height="10" rx="5" ry="5" fill="currentColor" />
      <rect x="40" y="25" width="10" height="10" rx="5" ry="0" fill="currentColor" />
      <rect x="10" y="40" width="10" height="10" rx="5" ry="0" fill="currentColor" />
      <rect x="25" y="40" width="10" height="10" rx="0" ry="5" fill="currentColor" />
      <rect x="40" y="40" width="10" height="10" rx="0" ry="0" fill="currentColor" />
    </svg>
  ),
  'classy-rounded': (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="10" y="10" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="25" y="10" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="40" y="10" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="10" y="25" width="10" height="10" rx="4" fill="currentColor" />
      <rect x="25" y="25" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="40" y="25" width="10" height="10" rx="4" fill="currentColor" />
      <rect x="10" y="40" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="25" y="40" width="10" height="10" rx="5" fill="currentColor" />
      <rect x="40" y="40" width="10" height="10" rx="3" fill="currentColor" />
    </svg>
  ),
};

// Corner Square Shape Icons
export const CornerSquareIcons = {
  square: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="17.5" y="17.5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="22.5" y="22.5" width="15" height="15" fill="currentColor" />
    </svg>
  ),
  'extra-rounded': (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="17.5" y="17.5" width="25" height="25" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="22.5" y="22.5" width="15" height="15" rx="5" fill="currentColor" />
    </svg>
  ),
  dot: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <circle cx="30" cy="30" r="12.5" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="30" cy="30" r="7.5" fill="currentColor" />
    </svg>
  ),
};

// Corner Dot Shape Icons
export const CornerDotIcons = {
  square: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="17.5" y="17.5" width="25" height="25" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="25" y="25" width="10" height="10" fill="currentColor" />
    </svg>
  ),
  dot: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="17.5" y="17.5" width="25" height="25" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="30" cy="30" r="5" fill="currentColor" />
    </svg>
  ),
};

// Background Border Style Icons
export const BorderStyleIcons = {
  square: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="5" y="5" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="15" y="15" width="8" height="8" fill="currentColor" />
      <rect x="26" y="15" width="8" height="8" fill="currentColor" />
      <rect x="37" y="15" width="8" height="8" fill="currentColor" />
    </svg>
  ),
  rounded: (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      <rect x="5" y="5" width="50" height="50" rx="12" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="15" y="15" width="8" height="8" fill="currentColor" />
      <rect x="26" y="15" width="8" height="8" fill="currentColor" />
      <rect x="37" y="15" width="8" height="8" fill="currentColor" />
    </svg>
  ),
};

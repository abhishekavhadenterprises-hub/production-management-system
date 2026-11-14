import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PremiumNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  size?: "sm" | "md";
  id?: string;
  name?: string;
  placeholder?: string;
}

export function PremiumNumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  disabled = false,
  className,
  inputClassName,
  size = "md",
  id,
  name,
  placeholder,
}: PremiumNumberInputProps) {
  const handleDecrement = () => {
    if (disabled) return;
    const nextVal = (value || 0) - step;
    if (min !== undefined && nextVal < min) return;
    onChange(nextVal);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const nextVal = (value || 0) + step;
    if (max !== undefined && nextVal > max) return;
    onChange(nextVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(0);
      return;
    }
    const num = Number(raw);
    if (!isNaN(num)) {
      if (max !== undefined && num > max) {
        onChange(max);
      } else if (min !== undefined && num < min) {
        onChange(min);
      } else {
        onChange(num);
      }
    }
  };

  const isMinReached = min !== undefined && value <= min;
  const isMaxReached = max !== undefined && value >= max;

  const sizeClasses = {
    sm: "h-7 text-xs rounded-lg",
    md: "h-8 text-xs rounded-xl",
  };

  const btnClasses = {
    sm: "w-6 h-full text-xs",
    md: "w-7 h-full text-xs",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center bg-white border border-[#E5E5EA] shadow-2xs overflow-hidden transition-all focus-within:border-[#007AFF] focus-within:ring-2 focus-within:ring-[#007AFF]/20",
        disabled && "opacity-50 cursor-not-allowed",
        sizeClasses[size],
        className
      )}
    >
      {/* Decrement (-) Button */}
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled || isMinReached}
        onClick={handleDecrement}
        className={cn(
          "flex items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] active:bg-[#E5E5EA] transition-colors select-none",
          (disabled || isMinReached) && "opacity-30 cursor-not-allowed hover:bg-transparent",
          btnClasses[size]
        )}
        aria-label="Decrease value"
      >
        <Minus className="w-3 h-3" />
      </button>

      {/* Direct Numeric Input with Optional Suffix */}
      <div className="flex-1 flex items-center justify-center px-1 min-w-[44px]">
        <input
          type="text"
          inputMode="numeric"
          id={id}
          name={name}
          disabled={disabled}
          value={isNaN(value) ? "" : value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "w-full text-center font-mono font-semibold text-[#1D1D1F] bg-transparent outline-none p-0 text-xs",
            inputClassName
          )}
        />
        {suffix && (
          <span className="text-[10px] text-[#86868B] font-mono ml-0.5 select-none shrink-0">
            {suffix}
          </span>
        )}
      </div>

      {/* Increment (+) Button */}
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled || isMaxReached}
        onClick={handleIncrement}
        className={cn(
          "flex items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] active:bg-[#E5E5EA] transition-colors select-none",
          (disabled || isMaxReached) && "opacity-30 cursor-not-allowed hover:bg-transparent",
          btnClasses[size]
        )}
        aria-label="Increase value"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

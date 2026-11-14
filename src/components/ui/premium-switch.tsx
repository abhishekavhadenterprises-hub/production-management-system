import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PremiumSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  color?: "blue" | "green";
  size?: "sm" | "md";
  className?: string;
  id?: string;
  name?: string;
}

export function PremiumSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  color = "blue",
  size = "md",
  className,
  id,
  name,
}: PremiumSwitchProps) {
  const toggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const activeColor = color === "green" ? "bg-[#34C759]" : "bg-[#007AFF]";

  const trackSizes = {
    sm: "w-7 h-4 p-0.5",
    md: "w-9 h-5 p-0.5",
  };

  const thumbSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  const thumbTranslate = {
    sm: "translate-x-3",
    md: "translate-x-4",
  };

  return (
    <label
      htmlFor={id}
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      className={cn(
        "inline-flex items-center gap-2 select-none cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {name && <input type="hidden" name={name} value={checked ? "true" : "false"} />}

      {/* Switch Track */}
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
          }
        }}
        className={cn(
          "rounded-full transition-colors duration-200 ease-in-out relative flex items-center shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30",
          checked ? activeColor : "bg-[#E5E5EA] group-hover:bg-[#D1D1D6]",
          trackSizes[size]
        )}
      >
        {/* Switch Thumb */}
        <div
          className={cn(
            "bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out pointer-events-none transform",
            thumbSizes[size],
            checked ? thumbTranslate[size] : "translate-x-0"
          )}
        />
      </div>

      {/* Label & Description */}
      {(label || description) && (
        <div className="text-left">
          {label && (
            <div className="text-xs font-semibold text-[#1D1D1F] leading-tight">
              {label}
            </div>
          )}
          {description && (
            <div className="text-[10px] text-[#86868B] leading-tight mt-0.5">
              {description}
            </div>
          )}
        </div>
      )}
    </label>
  );
}

export interface PremiumCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  color?: "blue" | "green";
  className?: string;
  id?: string;
  name?: string;
}

export function PremiumCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
  color = "blue",
  className,
  id,
  name,
}: PremiumCheckboxProps) {
  const toggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const activeBg = color === "green" ? "bg-[#34C759] border-[#34C759]" : "bg-[#007AFF] border-[#007AFF]";

  return (
    <label
      htmlFor={id}
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      className={cn(
        "inline-flex items-center gap-2 select-none cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {name && <input type="hidden" name={name} value={checked ? "true" : "false"} />}

      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
          }
        }}
        className={cn(
          "w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-150 shrink-0",
          checked
            ? cn(activeBg, "text-white shadow-2xs")
            : "bg-white border-[#C7C7CC] group-hover:border-[#8E8E93]",
          "focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
        )}
      >
        {checked && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
      </div>

      {label && (
        <span className="text-xs font-medium text-[#1D1D1F] select-none">
          {label}
        </span>
      )}
    </label>
  );
}

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PremiumDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
  buttonClassName?: string;
  popoverClassName?: string;
  size?: "sm" | "md";
  align?: "left" | "right";
  id?: string;
  name?: string;
  "aria-label"?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function PremiumDatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  disabled = false,
  min,
  max,
  className,
  buttonClassName,
  popoverClassName,
  size = "md",
  align = "left",
  id,
  name,
  "aria-label": ariaLabel,
}: PremiumDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view year and month from value, or today's date
  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(parsedDate.getMonth());

  // Synchronize view month/year if value changes externally
  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [value]);

  // Click outside and Escape handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build calendar matrix for current viewMonth
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Prev month padding days
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const formatted = `${viewYear}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleQuickJump = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    const formatted = `${y}-${m}-${d}`;
    onChange(formatted);
    setViewYear(y);
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  // Display label formatting
  const formattedDisplay = useMemo(() => {
    if (!value) return placeholder;
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    const [y, m, d] = parts;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [value, placeholder]);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs rounded-xl min-h-[28px] gap-1.5",
    md: "px-2.5 py-1.5 text-xs rounded-xl min-h-[34px] gap-2",
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left w-full", className)}
    >
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "w-full bg-white border border-[#E5E5EA] text-[#1D1D1F] font-medium shadow-2xs",
          "hover:border-[#D1D1D6] hover:bg-[#FAFAFC] focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20",
          "transition-all duration-150 flex items-center justify-between cursor-pointer select-none",
          isOpen && "border-[#007AFF] ring-2 ring-[#007AFF]/20 bg-white",
          disabled && "opacity-50 cursor-not-allowed hover:border-[#E5E5EA]",
          sizeClasses[size],
          buttonClassName
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
          <span className={cn("truncate font-medium", !value && "text-[#86868B]")}>
            {formattedDisplay}
          </span>
        </span>
      </button>

      {/* Floating Calendar Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "absolute z-50 mt-1.5 w-[280px] bg-white/95 backdrop-blur-md border border-[#E5E5EA]",
            "rounded-2xl shadow-apple-dropdown p-3 text-xs animate-in fade-in zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0",
            popoverClassName
          )}
        >
          {/* Header: Month/Year navigation */}
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#F2F2F7]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-semibold text-xs text-[#1D1D1F] tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick jump chips */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <button
              type="button"
              onClick={() => handleQuickJump(0)}
              className="flex-1 py-0.5 text-[10px] font-semibold text-[#007AFF] bg-[#E8F2FE] hover:bg-[#D5E8FD] rounded-md transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickJump(1)}
              className="flex-1 py-0.5 text-[10px] font-medium text-[#48484A] bg-[#F5F5F7] hover:bg-[#E5E5EA] rounded-md transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickJump(-1)}
              className="flex-1 py-0.5 text-[10px] font-medium text-[#48484A] bg-[#F5F5F7] hover:bg-[#E5E5EA] rounded-md transition-colors"
            >
              Yesterday
            </button>
          </div>

          {/* Day of Week Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEK_DAYS.map((wd) => (
              <span
                key={wd}
                className="text-[10px] font-semibold text-[#86868B] py-0.5"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous month trailing days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
              const dayNum = prevMonthDays - firstDayOfWeek + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="py-1 text-[11px] text-[#C7C7CC] select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const curFormatted = `${viewYear}-${String(viewMonth + 1).padStart(
                2,
                "0"
              )}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = curFormatted === value;
              const isToday =
                curFormatted === new Date().toISOString().split("T")[0];

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={cn(
                    "py-1 text-[11px] rounded-lg transition-all font-medium flex items-center justify-center relative",
                    isSelected
                      ? "bg-[#007AFF] text-white font-bold shadow-xs scale-105"
                      : "text-[#1D1D1F] hover:bg-[#F5F5F7] hover:text-[#007AFF]",
                    isToday && !isSelected && "font-bold text-[#007AFF]"
                  )}
                >
                  {dayNum}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#007AFF]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

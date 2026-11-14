import React, { useState, useRef, useEffect, useMemo, ReactNode } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PremiumDropdownOption {
  value: string;
  label: ReactNode;
  sublabel?: string;
  badge?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export type DropdownItem = string | PremiumDropdownOption;

export interface PremiumDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly DropdownItem[] | DropdownItem[];
  placeholder?: string;
  disabled?: boolean;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  id?: string;
  name?: string;
  "aria-label"?: string;
}

export function PremiumDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  icon,
  size = "md",
  align = "left",
  searchable,
  searchPlaceholder = "Search...",
  className,
  buttonClassName,
  menuClassName,
  id,
  name,
  "aria-label": ariaLabel,
}: PremiumDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to object format
  const normalizedOptions: PremiumDropdownOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Determine active item
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Auto-enable search if there are more than 7 options and searchable is not explicitly false
  const isSearchEnabled =
    searchable !== undefined ? searchable : normalizedOptions.length > 7;

  // Filter options if searching
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((opt) => {
      const labelText = typeof opt.label === "string" ? opt.label : opt.value;
      const sub = opt.sublabel || "";
      const b = opt.badge || "";
      return (
        labelText.toLowerCase().includes(q) ||
        sub.toLowerCase().includes(q) ||
        b.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q)
      );
    });
  }, [normalizedOptions, searchQuery]);

  // Click outside and escape handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
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

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen && isSearchEnabled) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isSearchEnabled]);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    setSearchQuery("");
  };

  const handleSelect = (val: string, isDisabled?: boolean) => {
    if (isDisabled) return;
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Size styling variants
  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs rounded-lg gap-1.5 min-h-[28px]",
    md: "px-3 py-1.5 text-xs rounded-xl gap-2 min-h-[34px]",
    lg: "px-3.5 py-2 text-sm rounded-xl gap-2.5 min-h-[40px]",
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left w-full", className)}
    >
      {/* Hidden native input for forms compatibility */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={toggleDropdown}
        className={cn(
          "w-full bg-white border border-[#E5E5EA] text-[#1D1D1F] font-medium shadow-2xs",
          "hover:border-[#D1D1D6] hover:bg-[#FAFAFC] focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20",
          "transition-all duration-150 flex items-center justify-between cursor-pointer select-none text-left",
          isOpen && "border-[#007AFF] ring-2 ring-[#007AFF]/20 bg-white",
          disabled && "opacity-50 cursor-not-allowed hover:border-[#E5E5EA] hover:bg-white",
          sizeStyles[size],
          buttonClassName
        )}
      >
        <span className="flex items-center gap-2 truncate min-w-0 flex-1">
          {icon && (
            <span className="shrink-0 text-[#007AFF] flex items-center">
              {icon}
            </span>
          )}
          {selectedOption ? (
            <span className="truncate flex items-center gap-1.5">
              {selectedOption.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              <span className="truncate">{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-[#86868B] truncate font-normal">
              {placeholder}
            </span>
          )}
        </span>

        <ChevronDown
          className={cn(
            "shrink-0 w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ml-1.5",
            isOpen && "rotate-180 text-[#007AFF]"
          )}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={cn(
            "absolute z-50 mt-1.5 w-full min-w-[200px] bg-white/95 backdrop-blur-md border border-[#E5E5EA]",
            "rounded-2xl shadow-apple-dropdown p-1.5 text-xs animate-in fade-in zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0",
            menuClassName
          )}
        >
          {/* Quick Search bar if enabled or list is long */}
          {isSearchEnabled && (
            <div className="p-1 pb-1.5 border-b border-[#F2F2F7] mb-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 bg-[#F5F5F7] border border-transparent focus:border-[#007AFF]/40 focus:bg-white rounded-lg text-xs text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-[#86868B] hover:text-[#1D1D1F]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-[#86868B] text-xs">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all",
                      isSelected
                        ? "bg-[#E8F2FE] text-[#007AFF] font-semibold"
                        : "text-[#1D1D1F] hover:bg-[#F5F5F7] hover:text-[#007AFF]",
                      opt.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-[#1D1D1F]"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                      {opt.icon && (
                        <span className="shrink-0">{opt.icon}</span>
                      )}
                      <div className="truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.sublabel && (
                          <div className="text-[10px] text-[#86868B] font-normal truncate">
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F2F2F7] text-[#6E6E73]">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

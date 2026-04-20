import { ChevronDown } from "lucide-react";

interface SimpleSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string; color?: string }>;
  className?: string;
}

export function SimpleSelect({
  value,
  onChange,
  placeholder = "Select...",
  options,
  className = "",
}: SimpleSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 px-4 pr-10 bg-white border-2 border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] transition-colors ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="w-5 h-5 text-gray-500" />
      </div>
    </div>
  );
}

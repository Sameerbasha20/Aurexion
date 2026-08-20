import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  containerStyle?: React.CSSProperties;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: externalValue,
  onChange,
  onDebouncedChange,
  debounceMs = 300,
  placeholder = "Search records...",
  containerStyle,
  style,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(externalValue || "");
  const debouncedValue = useDebounce(internalValue, debounceMs);

  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  useEffect(() => {
    if (onDebouncedChange) {
      onDebouncedChange(debouncedValue);
    }
  }, [debouncedValue, onDebouncedChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div style={{ position: "relative", flexGrow: 1, ...containerStyle }}>
      <Search
        size={16}
        color="#64748b"
        style={{
          position: "absolute",
          left: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "0.6rem 0.75rem 0.6rem 2.2rem",
          backgroundColor: "rgba(5, 8, 17, 0.7)",
          border: "1px solid rgba(140, 174, 187, 0.2)",
          borderRadius: "6px",
          color: "#f8fafc",
          fontSize: "0.85rem",
          outline: "none",
          ...style,
        }}
        {...props}
      />
    </div>
  );
};

export default SearchInput;


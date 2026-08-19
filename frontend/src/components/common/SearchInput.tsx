import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  containerStyle?: React.CSSProperties;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  containerStyle,
  style,
  ...props
}) => {
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
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "0.6rem 0.75rem 0.6rem 2.2rem",
          backgroundColor: "rgba(5, 8, 17, 0.7)",
          border: "1px solid rgba(140, 174, 187, 0.2)",
          borderRadius: "4px",
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

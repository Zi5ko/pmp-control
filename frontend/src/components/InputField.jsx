import { useId } from "react";
import "../styles/input-field.css";

export default function InputField({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  icon, // "mail" | "lock"
  autoComplete,
  autoFocus
}) {
  const id = useId();

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="control">
        {icon && <span className={`icon ${icon}`} aria-hidden="true" />}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
}
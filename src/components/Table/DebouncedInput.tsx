import React, { useEffect, useState } from "react";
import Input from "../Input";

/**
 * @author Ankur Mundra on May, 2023
 */

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  debounce?: number;
  value: any;
  className?: string;
  label?: string;
  onChange: (value: any) => void;
}

const DebouncedInput: React.FC<InputProps> = ({
  onChange,
  debounce = 500,
  value: initialValue,
  className = "",
  label = "",
  ...otherProps
}) => {
  const [value, setValue] = useState<string | number>(initialValue);
  useEffect(() => setValue(initialValue), [initialValue]);
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce);
    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <Input
      id={`table_filter_${Math.round(Math.random())}`}
      className={className}
      label={label}
      input={{
        ...otherProps,
        value: value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
      }}
    />
  );
};

export default DebouncedInput;

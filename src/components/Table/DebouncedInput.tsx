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
        // This is a live, debounced filter, not something meant to submit anything.
        // Table is sometimes rendered inside a page-level <form> (e.g. the Formik
        // form wrapping the whole assignment editor, including its Topics tab),
        // so an unguarded Enter here bubbles up as a form submit and navigates
        // away from the page the user was just searching on.
        onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") e.preventDefault();
        },
      }}
    />
  );
};

export default DebouncedInput;

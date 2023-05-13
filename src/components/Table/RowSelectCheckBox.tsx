import React, { HTMLProps, useEffect, useRef } from "react";

/**
 * @author Ankur Mundra on May, 2023
 */

interface CheckboxProps extends HTMLProps<HTMLInputElement> {
  indeterminate?: boolean;
}

const RowSelectCheckBox: React.FC<CheckboxProps> = ({ indeterminate, ...otherProps }) => {
  // null! is a hack to avoid having to make a conditional check within useEffect().
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !otherProps.checked && indeterminate;
    }
  }, [ref, indeterminate, otherProps.checked]);

  return <input ref={ref} type="checkbox" {...otherProps} />;
};

export default RowSelectCheckBox;

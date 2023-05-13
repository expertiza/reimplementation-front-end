import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import ToolTip from "./ToolTip";

/**
 * @author Ankur Mundra on May, 2023
 */

interface SelectProps {
  id: string;
  label?: string;
  tooltip?: string;
  input: any;
  options: { value: string; label: string }[];
  className?: string;
}

const Select: React.ForwardRefExoticComponent<SelectProps> = React.forwardRef((props, ref) => {
  const { className, id, label, input, options, tooltip } = props;

  const displayLabel = tooltip ? (
    <>
      {label + " "}
      <ToolTip id={`${id}-tooltip`} info={tooltip} />
    </>
  ) : (
    label
  );

  return (
    <InputGroup className={className}>
      <InputGroup.Text id={id}>{displayLabel}</InputGroup.Text>
      <Form.Select aria-label={label} ref={ref} {...input}>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </InputGroup>
  );
});

export default Select;

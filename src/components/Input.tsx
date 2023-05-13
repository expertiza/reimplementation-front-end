import React from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import ToolTip from "./ToolTip";

/**
 * @author Ankur Mundra on May, 2023
 */

interface InputProps {
  id: string;
  label?: string;
  tooltip?: string;
  input?: any;
  className?: string;
}

const Input: React.ForwardRefExoticComponent<InputProps> = React.forwardRef((props, ref) => {
  const displayLabel = props.tooltip ? (
    <>
      {props.label + " "}
      <ToolTip id={`${props.id}-tooltip`} info={props.tooltip} />
    </>
  ) : (
    props.label
  );

  return (
    <InputGroup className={props.className}>
      <InputGroup.Text id={props.id}>{displayLabel}</InputGroup.Text>
      <FormControl aria-label={props.label} ref={ref} {...props.input} />
    </InputGroup>
  );
});

export default Input;

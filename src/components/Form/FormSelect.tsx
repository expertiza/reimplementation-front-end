import { Field } from "formik";
import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import ToolTip from "../ToolTip";
import { IFormikFieldProps, IFormPropsWithOption } from "./interfaces";

/**
 * @author Ankur Mundra on May, 2023
 */

const FormSelect: React.FC<IFormPropsWithOption & { onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void }> = (props) => {
  const {
    as,
    md,
    name,
    label,
    type,
    controlId,
    options,
    tooltip,
    tooltipPlacement,
    disabled,
    inputGroupPrepend,
    onChange, // Add onChange to props to detect chnage in selected institutions.
  } = props;

  const displayLabel = tooltip ? (
    <>
      {label}&nbsp;
      <ToolTip id={`${controlId}-tooltip`} info={tooltip} placement={tooltipPlacement} />
    </>
  ) : (
    label
  );

  return (
    <Field name={name}>
      {({ field, form }: IFormikFieldProps) => {
        const isValid = !form.errors[field.name];
        const isInvalid = form.touched[field.name] && !isValid;
        return (
          <Form.Group as={as} md={md} controlId={controlId} className="mb-md-2">
            {label && <Form.Label>{displayLabel}</Form.Label>}
            <InputGroup>
              {inputGroupPrepend}
              <Form.Select
                {...field}
                type={type}
                disabled={disabled}
                isInvalid={isInvalid}
                feedback={form.errors[field.name]}
                onChange={(event) => {
                  field.onChange(event); // Call Formik's onChange
                  if (onChange) {
                    onChange(event); // Call the passed onChange if provided
                  }
                }}
              >
                {options.map((option) => {
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {form.errors[field.name]}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        );
      }}
    </Field>
  );
};

FormSelect.defaultProps = {
  type: "select",
  inputGroupPrepend: null,
};

export default FormSelect;

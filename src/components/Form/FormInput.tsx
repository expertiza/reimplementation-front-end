import { Field } from "formik";
import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import ToolTip from "../ToolTip";
import { IFormikFieldProps, IFormProps } from "./interfaces";

/**
 * @author Ankur Mundra on May, 2023
 */

const FormInput: React.FC<IFormProps> = (props) => { // Make sure it's being used here
  const {
    name,
    label,
    type,
    controlId,
    tooltip,
    as,
    md,
    disabled,
    inputGroupPrepend,
    inputGroupAppend,
    tooltipPlacement,
    rows, // rows should be passed as part of props now
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
                  <Form.Control
                      {...field}
                      type={type}
                      disabled={disabled}
                      isInvalid={isInvalid}
                      feedback={form.errors[field.name]}
                      as={as} // Add the "as" prop so it can handle "textarea"
                      rows={rows} // Pass the "rows" prop if it's a textarea
                  />
                  {inputGroupAppend}
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

export default FormInput;

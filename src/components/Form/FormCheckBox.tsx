import { Field } from "formik";
import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import ToolTip from "../ToolTip";
import { IFormikFieldProps, IFormProps } from "./interfaces";

/**
 * @author Ankur Mundra on May, 2023
 */

const FormCheckbox: React.FC<IFormProps> = (props) => {
  const { controlId, label, name, disabled, tooltip, tooltipPlacement } = props;

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
        return (
          <Form.Group controlId={controlId}>
            <InputGroup>
              <Form.Check
                {...field}
                checked={field.value}
                className="mx-md-2"
                type="checkbox"
                disabled={disabled}
                label={displayLabel}
                isInvalid={form.touched[field.name] && form.errors[field.name]}
                feedback={form.errors[field.name]}
              />
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

export default FormCheckbox;

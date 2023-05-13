import { Field } from "formik";
import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import ToolTip from "../ToolTip";
import { IFormikFieldProps, IFormProps } from "./interfaces";

/**
 * @author Ankur Mundra on May, 2023
 */

interface IFormRangeProps extends IFormProps {
  min?: number;
  max?: number;
  step?: number;
}

const FormRange: React.FC<IFormRangeProps> = (props) => {
  const { controlId, label, name, min, max, step, as, md, disabled, tooltip, tooltipPlacement } =
    props;

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
      {({ field, form }: IFormikFieldProps) => (
        <Form.Group as={as} md={md} controlId={controlId} className="mb-md-2">
          {label && (
            <Form.Label>
              {displayLabel}: {field.value}{" "}
            </Form.Label>
          )}
          <InputGroup>
            <Form.Control
              {...field}
              type="range"
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              isInvalid={form.touched[field.name] && form.errors[field.name]}
            />
            <Form.Control.Feedback type="invalid">{form.errors[field.name]}</Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
      )}
    </Field>
  );
};

FormRange.defaultProps = {
  min: 0,
  max: 100,
  step: 1,
};

export default FormRange;

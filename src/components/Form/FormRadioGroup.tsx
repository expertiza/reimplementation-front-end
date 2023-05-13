import { Field } from "formik";
import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import ToolTip from "../ToolTip";
import { IFormikFieldProps, IFormPropsWithOption } from "./interfaces";

/**
 * @author Ankur Mundra on May, 2023
 */

const FormRadioGroup: React.FC<IFormPropsWithOption> = (props) => {
  const { as, md, controlId, label, name, options, disabled, tooltip, tooltipPlacement } = props;

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
          {label && <Form.Label>{displayLabel}</Form.Label>}
          <InputGroup>
            {options.map((option) => (
              <Form.Check
                {...field}
                key={option.value}
                type="radio"
                disabled={disabled}
                label={option.label}
                value={option.value}
                checked={field.value === option.value}
                onChange={() => form.setFieldValue(name, option.value)}
              />
            ))}
          </InputGroup>
        </Form.Group>
      )}
    </Field>
  );
};

export default FormRadioGroup;

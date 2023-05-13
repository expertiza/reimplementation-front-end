import { Field } from "formik";
import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import ToolTip from "../ToolTip";
import { IFormikFieldProps, IFormPropsWithOption } from "./interfaces";

/**
 * @author Ankur Mundra on May, 2023
 */

const FormCheckboxGroup: React.FC<IFormPropsWithOption> = (props) => {
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
        <Form.Group as={as} md={md} controlId={controlId}>
          {label && <Form.Label>{displayLabel}</Form.Label>}
          <InputGroup>
            {options.map((option) => (
              <Form.Check
                {...field}
                key={option.value}
                type="checkbox"
                className="mx-md-2"
                label={option.label}
                value={option.value}
                disabled={disabled}
                checked={field.value.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    form.setFieldValue(name, [...field.value, option.value]);
                  } else {
                    form.setFieldValue(
                      name,
                      field.value.filter((value: string) => value !== option.value)
                    );
                  }
                }}
              />
            ))}
          </InputGroup>
        </Form.Group>
      )}
    </Field>
  );
};

export default FormCheckboxGroup;

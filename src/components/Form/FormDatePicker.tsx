import { Field } from "formik";
import React from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IFormikFieldProps } from "./interfaces";

/**
 * @author Ankur Mundra on May, 2023
 */

interface IFormDatePickerProps {
  controlId: string;
  name: string;
}

const FormDatePicker: React.FC<IFormDatePickerProps> = (props) => {
  const { controlId, name } = props;

  return (
    <Field name={name}>
      {({ field, form }: IFormikFieldProps) => {
        const isValid = !form.errors[field.name];
        const isInvalid = form.touched[field.name] && !isValid;
        return (
          <Form.Group controlId={controlId}>
            <DatePicker
              required
              showTimeSelect
              timeIntervals={60}
              minDate={new Date()}
              selected={field.value || null}
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select a Due Date"
              onChange={(val) => form.setFieldValue(field.name, val)}
              className={`form-control ${isInvalid ? "is-invalid" : ""}`}
            />
            <Form.Control.Feedback type="invalid">{form.errors[field.name]}</Form.Control.Feedback>
          </Form.Group>
        );
      }}
    </Field>
  );
};

export default FormDatePicker;

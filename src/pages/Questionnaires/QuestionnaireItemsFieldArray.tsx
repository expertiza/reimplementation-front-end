import React from "react";
import { Field, FieldArray, FieldArrayRenderProps, ErrorMessage } from "formik";
import { IoIosRemoveCircleOutline, IoIosAddCircleOutline } from "react-icons/io";
import * as Yup from "yup";

interface Props {
  values: any;
  errors: any;
  touched: any;
}

const QuestionnaireItemsFieldArray: React.FC<Props> = ({ values, errors, touched }) => {
  return (
    <FieldArray name="items">
      {({ push, remove }: FieldArrayRenderProps) => (
        <>
          {values.items.map((item: any, index: number) => (
            <div key={index} className="border rounded p-3 mb-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Item {index + 1}</strong>
                <IoIosRemoveCircleOutline
                  size={22}
                  className="text-danger cursor-pointer"
                  onClick={() => remove(index)}
                  title="Remove question"
                />
              </div>

              <Field
                name={`items[${index}].txt`}
                placeholder="Question text"
                className="form-control mb-2"
              />

              <Field
                as="select"
                name={`items[${index}].question_type`}
                className="form-control mb-2"
              >
                <option value="">Select Question Type</option>
                <option value="dropdown">Dropdown</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="scale">Scale</option>
              </Field>


              {(item.question_type === "dropdown" || item.question_type === "multiple_choice") && (
                <>
                  <Field
                    name={`items[${index}].alternatives`}
                    placeholder="Comma-separated choices"
                    className="form-control mb-2"
                  />
                </>
              )}

              {item.question_type === "scale" && (
                <div className="d-flex gap-2 mb-2">
                  <Field
                    name={`items[${index}].min_label`}
                    placeholder="Min Label"
                    className="form-control"
                  />
                  <Field
                    name={`items[${index}].max_label`}
                    placeholder="Max Label"
                    className="form-control"
                  />
                </div>
              )}

              <Field
                name={`items[${index}].weight`}
                type="number"
                className="form-control"
                placeholder="Weight (e.g. 1)"
              />


              {/*error messages for each questionnaire item rendered below all fields*/}
              <ErrorMessage
                name={`items[${index}].txt`}
                component="div"
                className="text-danger"
              />

              <ErrorMessage
                name={`items[${index}].question_type`}
                component="div"
                className="text-danger"
              />

              <ErrorMessage
                name={`items[${index}].weight`}
                component="div"
                className="text-danger"
              />

              {(item.question_type === "dropdown" || item.question_type === "multiple_choice") && (
                <>
                  <ErrorMessage
                    name={`items[${index}].alternatives`}
                    component="div"
                    className="text-danger"
                  />
                </>
              )}

              {(item.question_type === "scale") && (
                <>
                  <ErrorMessage
                    name={`items[${index}].min_label`}
                    component="div"
                    className="text-danger"
                  />
                  <ErrorMessage
                    name={`items[${index}].max_label`}
                    component="div"
                    className="text-danger"
                  />
                </>
              )}




            </div>


          ))}

          <div className="d-flex align-items-center gap-2">
            <IoIosAddCircleOutline
              size={24}
              className="text-success cursor-pointer"
              onClick={() =>
                push({
                  txt: "",
                  weight: 1,
                  question_type: "",
                  break_before: false,
                  alternatives: "",
                  min_label: "",
                  max_label: ""
                })
              }
              title="Add question"
            />
            <span className="text-muted">Add Question</span>
          </div>
        </>
      )}
    </FieldArray>
  );
};

export default QuestionnaireItemsFieldArray;

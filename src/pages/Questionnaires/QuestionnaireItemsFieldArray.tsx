import React, { useState } from "react";
import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  ErrorMessage,
} from "formik";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { FaPlus, FaInfoCircle } from "react-icons/fa";
import { IItem } from "./QuestionnaireUtils";

interface Props {
  values: any;
  errors: any;
  touched: any;
  itemTypes: string[];
}

const QuestionnaireItemsFieldArray: React.FC<Props> = ({
  values,
  errors,
  touched,
  itemTypes,
}) => {
  const [questionType, setQuestionType] = useState("");
  const [numQuestions, setNumQuestions] = useState<number | "">("");
  const [showNumbers, setShowNumbers] = useState(false);


  return (
    <FieldArray name="items">
      {({ push, remove, move, form }: FieldArrayRenderProps) => {
        const { setFieldValue } = form;

        const handleRemove = (index: number) => {
          const item = values.items[index];
          if (item.id) {
            setFieldValue(`items[${index}]._destroy`, true);
          } else {
            remove(index);
          }
        };

        const visibleItems: Array<{ item: IItem; index: number }> =
          values.items
            .map((item: IItem, index: number) => ({ item, index }))
            .filter(({ item }: { item: IItem }) => !item._destroy);

        return (
          <>
            <DragDropContext
              onDragEnd={(result: DropResult) => {
                if (!result.destination) return;
                move(result.source.index, result.destination.index);
              }}
            >
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {visibleItems.length > 0 && (
                      <table
                          className="table table-bordered table-hover table-striped align-middle mb-2 w-100"
                          style={{ fontSize: "13px", tableLayout: "fixed" }}
                        >
                          <thead className="table-light">
                            <tr>
                              {showNumbers && (
                                <th style={{ width: "36px" }}>#</th>
                              )}
                              <th style={{ width: "110px" }}>Type</th>
                              <th style={{ width: "200px" }}>
                                Prompt{" "}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      The question or statement shown to the reviewer.
                                      Max 100 characters.
                                    </Tooltip>
                                  }
                                >
                                  <span style={{ cursor: "pointer", color: "#6c757d" }}>
                                    <FaInfoCircle size={11} />
                                  </span>
                                </OverlayTrigger>
                              </th>
                              <th style={{ width: "140px" }}>Row Names</th>
                              <th style={{ width: "160px" }}>Column Names</th>
                              <th style={{ width: "85px" }}>Min Label</th>
                              <th style={{ width: "85px" }}>Max Label</th>
                              <th style={{ width: "70px" }}>
                                Rows{" "}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      Height (number of rows) — applies to{" "}
                                      <strong>Criterion</strong>,{" "}
                                      <strong>Text area</strong>, and{" "}
                                      <strong>Grid</strong> items.
                                    </Tooltip>
                                  }
                                >
                                  <span style={{ cursor: "pointer", color: "#6c757d" }}>
                                    <FaInfoCircle size={11} />
                                  </span>
                                </OverlayTrigger>
                              </th>
                              <th style={{ width: "70px" }}>
                                Cols{" "}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      Width (number of columns) — applies to{" "}
                                      <strong>Criterion</strong>,{" "}
                                      <strong>Text area</strong>,{" "}
                                      <strong>Text field</strong>, and{" "}
                                      <strong>Grid</strong> items.
                                    </Tooltip>
                                  }
                                >
                                  <span style={{ cursor: "pointer", color: "#6c757d" }}>
                                    <FaInfoCircle size={11} />
                                  </span>
                                </OverlayTrigger>
                              </th>
                              <th style={{ width: "60px" }}>Weight</th>
                              <th
                                style={{ width: "50px" }}
                                className="text-center"
                              >
                                Del
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleItems.map(
                              ({
                                item,
                                index,
                              }: {
                                item: IItem;
                                index: number;
                              }) => (
                                <Draggable
                                  key={item.id ?? `new-${index}`}
                                  draggableId={(
                                    item.id ?? `new-${index}`
                                  ).toString()}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <tr
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={
                                        snapshot.isDragging ? "table-primary" : ""
                                      }
                                      style={{
                                        ...provided.draggableProps.style,
                                        cursor: "grab",
                                      }}
                                    >
                                      {/* # column */}
                                      {showNumbers && (
                                        <td className="fw-semibold text-center">
                                          {index + 1}
                                        </td>
                                      )}

                                      {/* Type */}
                                      <td
                                        className="fw-semibold"
                                        style={{ whiteSpace: "nowrap" }}
                                      >
                                        {item.question_type}
                                      </td>

                                      {/* Question Text */}
                                      <td>
                                        <Field
                                          as="textarea"
                                          rows={2}
                                          name={`items[${index}].txt`}
                                          placeholder="Prompt"
                                          className="form-control form-control-sm"
                                          maxLength={100}
                                          style={{ resize: "vertical", fieldSizing: "content" } as React.CSSProperties}
                                        />
                                        <ErrorMessage
                                          name={`items[${index}].txt`}
                                          component="div"
                                          className="text-danger small"
                                        />
                                      </td>

                                      {/* Row Names (Grid only) */}
                                      <td>
                                        {item.question_type === "Grid" ? (
                                          <Field
                                            as="textarea"
                                            name={`items[${index}].row_names`}
                                            placeholder="Rows (comma-sep)"
                                            className="form-control form-control-sm"
                                            style={{ width: "100%", minHeight: "2.5rem", fieldSizing: "content", resize: "vertical" } as React.CSSProperties}
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Column Names / Choices */}
                                      <td>
                                        {(item.question_type ===
                                          "Multiple choice" ||
                                          item.question_type ===
                                            "Dropdown") ? (
                                          <>
                                            <Field
                                              name={`items[${index}].alternatives`}
                                              placeholder="Choices (comma-sep)"
                                              className="form-control form-control-sm"
                                            />
                                            <ErrorMessage
                                              name={`items[${index}].alternatives`}
                                              component="div"
                                              className="text-danger small"
                                            />
                                          </>
                                        ) : item.question_type === "Grid" ? (
                                          <Field
                                            as="textarea"
                                            name={`items[${index}].column_names`}
                                            placeholder="Columns (comma-sep)"
                                            className="form-control form-control-sm"
                                            style={{ width: "100%", minHeight: "2.5rem", fieldSizing: "content", resize: "vertical" } as React.CSSProperties}
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Min Label */}
                                      <td>
                                        {(item.question_type === "Scale" ||
                                          item.question_type ===
                                            "Criterion") ? (
                                          <Field
                                            name={`items[${index}].min_label`}
                                            placeholder="Min Label"
                                            className="form-control form-control-sm"
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Max Label */}
                                      <td>
                                        {(item.question_type === "Scale" ||
                                          item.question_type ===
                                            "Criterion") ? (
                                          <Field
                                            name={`items[${index}].max_label`}
                                            placeholder="Max Label"
                                            className="form-control form-control-sm"
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Height / Rows */}
                                      <td>
                                        {(item.question_type === "Criterion" ||
                                          item.question_type ===
                                            "Text area") ? (
                                          <Field
                                            name={`items[${index}].textarea_height`}
                                            type="number"
                                            placeholder="Rows"
                                            className="form-control form-control-sm"
                                          />
                                        ) : item.question_type === "Grid" ? (
                                          <Field
                                            name={`items[${index}].rows`}
                                            type="number"
                                            placeholder="# Rows"
                                            className="form-control form-control-sm"
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Width / Cols */}
                                      <td>
                                        {(item.question_type === "Criterion" ||
                                          item.question_type ===
                                            "Text area") ? (
                                          <Field
                                            name={`items[${index}].textarea_width`}
                                            type="number"
                                            placeholder="Cols."
                                            className="form-control form-control-sm"
                                          />
                                        ) : item.question_type === "Text field" ? (
                                          <Field
                                            name={`items[${index}].textbox_width`}
                                            type="number"
                                            placeholder="Cols."
                                            className="form-control form-control-sm"
                                          />
                                        ) : item.question_type === "Grid" ? (
                                          <Field
                                            name={`items[${index}].columns`}
                                            type="number"
                                            placeholder="# Cols"
                                            className="form-control form-control-sm"
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Weight */}
                                      <td>
                                        {(item.question_type ===
                                          "Multiple choice" ||
                                          item.question_type === "Dropdown" ||
                                          item.question_type === "Scale" ||
                                          item.question_type ===
                                            "Criterion") ? (
                                          <Field
                                            name={`items[${index}].weight`}
                                            type="number"
                                            placeholder="Wt."
                                            maxLength={3}
                                            className="form-control form-control-sm"
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Delete */}
                                      <td className="text-center">
                                        <OverlayTrigger
                                          overlay={
                                            <Tooltip>Remove Item</Tooltip>
                                          }
                                        >
                                          <Button
                                            variant="link"
                                            onClick={() => handleRemove(index)}
                                            aria-label="Remove Item"
                                            className="p-0"
                                          >
                                            <img
                                              src="/assets/images/delete-icon-24.png"
                                              alt="remove item"
                                              style={{
                                                width: "20px",
                                                height: "20px",
                                              }}
                                            />
                                          </Button>
                                        </OverlayTrigger>
                                      </td>
                                    </tr>
                                  )}
                                </Draggable>
                              )
                            )}
                          </tbody>
                        </table>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Add items controls */}
            <div className="d-flex gap-2 mb-3 align-items-center flex-wrap">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm fw-semibold px-3"
                onClick={() => {
                  const questionCount =
                    typeof numQuestions === "number" ? numQuestions : 0;
                  for (let i = 0; i < questionCount; i++) {
                    const isGrid = questionType === "Grid";
                    push({
                      id: undefined,
                      txt: isGrid
                        ? "Please rate the following aspects of the submission:"
                        : "",
                      weight: "",
                      question_type: questionType,
                      break_before: 1,
                      alternatives: "",
                      column_names: isGrid
                        ? "Strongly Disagree,Disagree,Neutral,Agree,Strongly Agree"
                        : "",
                      row_names: isGrid
                        ? "Clarity,Completeness,Correctness,Creativity"
                        : "",
                      columns: isGrid ? "5" : "",
                      rows: isGrid ? "4" : "",
                      min_label: "",
                      max_label: "",
                      seq: values.items.length + 1,
                    });
                  }
                  setNumQuestions("");
                  setQuestionType("");
                }}
              >
                <FaPlus className="me-1 mb-1" /> Add
              </button>

              <span title="How many items?">
                <Field
                  type="number"
                  name="numQuestions"
                  placeholder="#"
                  value={numQuestions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNumQuestions(Number(e.target.value))
                  }
                  className="form-control form-control-sm"
                  maxLength={3}
                  style={{ width: "60px" }}
                />
              </span>

              <select
                className="form-control form-control-sm"
                value={questionType}
                style={{ width: "160px" }}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option value="">- Select item type -</option>
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <span className="fw-semibold small">items</span>

              <div className="form-check ms-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showNumbersToggle"
                  checked={showNumbers}
                  onChange={(e) => setShowNumbers(e.target.checked)}
                />
                <label
                  htmlFor="showNumbersToggle"
                  className="form-check-label fw-semibold small"
                >
                  Show item numbers
                </label>
              </div>
            </div>
          </>
        );
      }}
    </FieldArray>
  );
};

export default QuestionnaireItemsFieldArray;

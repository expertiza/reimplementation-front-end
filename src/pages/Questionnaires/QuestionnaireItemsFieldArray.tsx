import React, { useState } from "react";
import { Field, FieldArray, FieldArrayRenderProps, ErrorMessage } from "formik";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { FaPlus, FaInfoCircle, FaGripVertical } from "react-icons/fa";
import { IItem } from "./QuestionnaireUtils";

interface Props {
  values: any;
  errors: any;
  touched: any;
  itemTypes: string[];
}

const QuestionnaireItemsFieldArray: React.FC<Props> = ({ values, errors, touched, itemTypes }) => {
  const [itemType, setItemType] = useState("");
  const [numItems, setNumItems] = useState<number | "">("");
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

        /**
         * visibleItems maps visible position → full-array index.
         * We keep this separation so that soft-deleted (_destroy) items
         * stay in the array but are invisible.
         */
        const visibleItems: Array<{ item: IItem; fullIndex: number }> = (
          values.items as IItem[]
        )
          .map((item, fullIndex) => ({ item, fullIndex }))
          .filter(({ item }) => !item._destroy);

        /**
         * When a drag ends we get source/destination positions within the
         * *visible* list.  We need to translate those to full-array indices
         * before calling Formik's move(), because hidden (_destroy) items
         * can occupy slots in the middle of the array.
         */
        const handleDragEnd = (result: DropResult) => {
          if (!result.destination) return;
          if (result.source.index === result.destination.index) return;

          const srcFullIndex = visibleItems[result.source.index].fullIndex;
          const dstFullIndex = visibleItems[result.destination.index].fullIndex;

          // Formik move() splices item at srcFullIndex and inserts before dstFullIndex
          move(srcFullIndex, dstFullIndex);

          // Update `seq` values so the backend receives the new order
          // We do this after the move completes (next tick) because Formik
          // hasn't committed the swap yet when this callback runs.
          setTimeout(() => {
            const updatedItems: IItem[] = form.values.items as IItem[];
            updatedItems.forEach((item: IItem, i: number) => {
              if (!item._destroy) {
                setFieldValue(`items[${i}].seq`, i + 1);
              }
            });
          }, 0);
        };

        return (
          <>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questionnaire-items">
                {(droppableProvided) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                  >
                    {visibleItems.length > 0 && (
                      <div
                        style={{
                          overflowX: "auto",
                          borderRadius: "8px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                        }}
                      >
                        <table
                          className="table table-bordered table-hover align-middle mb-2 w-100"
                          style={{ fontSize: "13px", tableLayout: "fixed", minWidth: "900px" }}
                        >
                          <thead className="table-light">
                            <tr>
                              {/* Drag handle column */}
                              <th style={{ width: "36px" }} aria-label="Drag handle" />
                              {showNumbers && <th style={{ width: "36px" }}>#</th>}
                              <th style={{ width: "110px" }}>Type</th>
                              <th style={{ width: "200px" }}>
                                Prompt{" "}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      The item or statement shown to the reviewer. Max 100 characters.
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
                                      Height (number of rows) — applies to <strong>Criterion</strong>,{" "}
                                      <strong>Text area</strong>, and <strong>Grid</strong> items.
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
                                      <strong>Criterion</strong>, <strong>Text area</strong>,{" "}
                                      <strong>Text field</strong>, and <strong>Grid</strong> items.
                                    </Tooltip>
                                  }
                                >
                                  <span style={{ cursor: "pointer", color: "#6c757d" }}>
                                    <FaInfoCircle size={11} />
                                  </span>
                                </OverlayTrigger>
                              </th>
                              <th style={{ width: "60px" }}>Weight</th>
                              <th style={{ width: "50px" }} className="text-center">
                                Del
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleItems.map(
                              (
                                { item, fullIndex }: { item: IItem; fullIndex: number },
                                visiblePosition: number
                              ) => (
                                <Draggable
                                  key={
                                    item.id !== undefined && item.id !== null
                                      ? `item-${item.id}`
                                      : `new-${fullIndex}`
                                  }
                                  draggableId={
                                    item.id !== undefined && item.id !== null
                                      ? `item-${item.id}`
                                      : `new-${fullIndex}`
                                  }
                                  index={visiblePosition}
                                >
                                  {(draggableProvided, snapshot) => (
                                    <tr
                                      ref={draggableProvided.innerRef}
                                      {...draggableProvided.draggableProps}
                                      style={{
                                        ...draggableProvided.draggableProps.style,
                                        background: snapshot.isDragging
                                          ? "rgba(13,110,253,0.08)"
                                          : undefined,
                                        boxShadow: snapshot.isDragging
                                          ? "0 4px 16px rgba(13,110,253,0.18)"
                                          : undefined,
                                        borderRadius: snapshot.isDragging ? "6px" : undefined,
                                        opacity: snapshot.isDragging ? 0.95 : 1,
                                        transition: snapshot.isDragging
                                          ? undefined
                                          : "background 0.15s ease",
                                      }}
                                    >
                                      {/* Drag handle — only this cell initiates dragging */}
                                      <td
                                        {...draggableProvided.dragHandleProps}
                                        className="text-center"
                                        style={{
                                          cursor: snapshot.isDragging ? "grabbing" : "grab",
                                          color: snapshot.isDragging ? "#0d6efd" : "#adb5bd",
                                          userSelect: "none",
                                          verticalAlign: "middle",
                                          transition: "color 0.15s ease",
                                        }}
                                        title="Drag to reorder"
                                        aria-label="Drag to reorder item"
                                      >
                                        <FaGripVertical size={14} />
                                      </td>

                                      {/* # column */}
                                      {showNumbers && (
                                        <td className="fw-semibold text-center text-muted">
                                          {visiblePosition + 1}
                                        </td>
                                      )}

                                      {/* Type */}
                                      <td
                                        className="fw-semibold"
                                        style={{ whiteSpace: "nowrap" }}
                                      >
                                        {item.question_type}
                                      </td>

                                      {/* Item Text */}
                                      <td>
                                        <Field
                                          as="textarea"
                                          rows={2}
                                          name={`items[${fullIndex}].txt`}
                                          placeholder="Prompt"
                                          className="form-control form-control-sm"
                                          maxLength={100}
                                          style={
                                            {
                                              resize: "vertical",
                                              fieldSizing: "content",
                                            } as React.CSSProperties
                                          }
                                        />
                                        <ErrorMessage
                                          name={`items[${fullIndex}].txt`}
                                          component="div"
                                          className="text-danger small"
                                        />
                                      </td>

                                      {/* Row Names (Grid only) */}
                                      <td>
                                        {item.question_type === "Grid" ? (
                                          <Field
                                            as="textarea"
                                            name={`items[${fullIndex}].row_names`}
                                            placeholder="Rows (comma-sep)"
                                            className="form-control form-control-sm"
                                            style={
                                              {
                                                width: "100%",
                                                minHeight: "2.5rem",
                                                fieldSizing: "content",
                                                resize: "vertical",
                                              } as React.CSSProperties
                                            }
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Column Names / Choices */}
                                      <td>
                                        {item.question_type === "Multiple choice" ||
                                        item.question_type === "Dropdown" ? (
                                          <>
                                            <Field
                                              name={`items[${fullIndex}].alternatives`}
                                              placeholder="Choices (comma-sep)"
                                              className="form-control form-control-sm"
                                            />
                                            <ErrorMessage
                                              name={`items[${fullIndex}].alternatives`}
                                              component="div"
                                              className="text-danger small"
                                            />
                                          </>
                                        ) : item.question_type === "Grid" ? (
                                          <Field
                                            as="textarea"
                                            name={`items[${fullIndex}].column_names`}
                                            placeholder="Columns (comma-sep)"
                                            className="form-control form-control-sm"
                                            style={
                                              {
                                                width: "100%",
                                                minHeight: "2.5rem",
                                                fieldSizing: "content",
                                                resize: "vertical",
                                              } as React.CSSProperties
                                            }
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Min Label */}
                                      <td>
                                        {item.question_type === "Scale" ||
                                        item.question_type === "Criterion" ? (
                                          <Field
                                            name={`items[${fullIndex}].min_label`}
                                            placeholder="Min Label"
                                            className="form-control form-control-sm"
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Max Label */}
                                      <td>
                                        {item.question_type === "Scale" ||
                                        item.question_type === "Criterion" ? (
                                          <Field
                                            name={`items[${fullIndex}].max_label`}
                                            placeholder="Max Label"
                                            className="form-control form-control-sm"
                                          />
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>

                                      {/* Height / Rows */}
                                      <td>
                                        {item.question_type === "Criterion" ||
                                        item.question_type === "Text area" ? (
                                          <Field
                                            name={`items[${fullIndex}].textarea_height`}
                                            type="number"
                                            placeholder="Rows"
                                            className="form-control form-control-sm"
                                          />
                                        ) : item.question_type === "Grid" ? (
                                          <Field
                                            name={`items[${fullIndex}].rows`}
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
                                        {item.question_type === "Criterion" ||
                                        item.question_type === "Text area" ? (
                                          <Field
                                            name={`items[${fullIndex}].textarea_width`}
                                            type="number"
                                            placeholder="Cols."
                                            className="form-control form-control-sm"
                                          />
                                        ) : item.question_type === "Text field" ? (
                                          <Field
                                            name={`items[${fullIndex}].textbox_width`}
                                            type="number"
                                            placeholder="Cols."
                                            className="form-control form-control-sm"
                                          />
                                        ) : item.question_type === "Grid" ? (
                                          <Field
                                            name={`items[${fullIndex}].columns`}
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
                                        {item.question_type === "Multiple choice" ||
                                        item.question_type === "Dropdown" ||
                                        item.question_type === "Scale" ||
                                        item.question_type === "Criterion" ? (
                                          <Field
                                            name={`items[${fullIndex}].weight`}
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
                                          overlay={<Tooltip>Remove Item</Tooltip>}
                                        >
                                          <Button
                                            variant="link"
                                            onClick={() => handleRemove(fullIndex)}
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
                      </div>
                    )}
                    {droppableProvided.placeholder}
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
                  const itemCount = typeof numItems === "number" ? numItems : 0;
                  for (let i = 0; i < itemCount; i++) {
                    const isGrid = itemType === "Grid";
                    push({
                      id: undefined,
                      txt: isGrid ? "Please rate the following aspects of the submission:" : "",
                      weight: "",
                      question_type: itemType,
                      break_before: 1,
                      alternatives: "",
                      column_names: isGrid
                        ? "Strongly Disagree,Disagree,Neutral,Agree,Strongly Agree"
                        : "",
                      row_names: isGrid ? "Clarity,Completeness,Correctness,Creativity" : "",
                      columns: isGrid ? "5" : "",
                      rows: isGrid ? "4" : "",
                      min_label: "",
                      max_label: "",
                      seq: values.items.length + 1,
                    });
                  }
                  setNumItems("");
                  setItemType("");
                }}
              >
                <FaPlus className="me-1 mb-1" /> Add
              </button>

              <span title="How many items?">
                <Field
                  type="number"
                  name="numItems"
                  placeholder="#"
                  value={numItems}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNumItems(Number(e.target.value))
                  }
                  className="form-control form-control-sm"
                  maxLength={3}
                  style={{ width: "60px" }}
                />
              </span>

              <select
                className="form-control form-control-sm"
                value={itemType}
                style={{ width: "160px" }}
                onChange={(e) => setItemType(e.target.value)}
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
                <label htmlFor="showNumbersToggle" className="form-check-label fw-semibold small">
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

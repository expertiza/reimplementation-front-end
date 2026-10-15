import React, { useState } from "react";
import { Field, FieldArray, FieldArrayRenderProps, ErrorMessage } from "formik";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { FaPlus, FaGripVertical } from "react-icons/fa";
import { IItem } from "./QuestionnaireUtils";

interface Props {
  values: any;
  errors: any;
  touched: any;
  itemTypes: string[];
}

/* ─── type-badge colours ─────────────────────────────────────── */
const TYPE_COLOURS: Record<string, { bg: string; text: string }> = {
  "Scale":          { bg: "#dbeafe", text: "#1d4ed8" },
  "Criterion":      { bg: "#ede9fe", text: "#6d28d9" },
  "Multiple choice":{ bg: "#dcfce7", text: "#15803d" },
  "Dropdown":       { bg: "#fef9c3", text: "#854d0e" },
  "Grid":           { bg: "#fee2e2", text: "#b91c1c" },
  "Text area":      { bg: "#f0fdf4", text: "#166534" },
  "Text field":     { bg: "#f0f9ff", text: "#0369a1" },
  "Checkbox":       { bg: "#fdf4ff", text: "#7e22ce" },
};

/* ─── helpers ────────────────────────────────────────────────── */
const typeBadgeStyle = (qtype: string): React.CSSProperties => {
  const c = TYPE_COLOURS[qtype] ?? { bg: "#f3f4f6", text: "#374151" };
  return {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    background: c.bg,
    color: c.text,
    whiteSpace: "nowrap",
  };
};

const fieldLabel = (label: string) => (
  <label
    style={{
      display: "block",
      fontSize: "11px",
      fontWeight: 600,
      color: "#6b7280",
      marginBottom: "3px",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    }}
  >
    {label}
  </label>
);

/* ─── main component ─────────────────────────────────────────── */
const QuestionnaireItemsFieldArray: React.FC<Props> = ({
  values,
  errors,
  touched,
  itemTypes,
}) => {
  const [itemType, setItemType] = useState("");
  const [numItems, setNumItems] = useState<number | "">("");
  const [showNumbers, setShowNumbers] = useState(false);

  return (
    <FieldArray name="items">
      {({ push, remove, move, form }: FieldArrayRenderProps) => {
        const { setFieldValue } = form;

        const handleRemove = (fullIndex: number) => {
          const item = values.items[fullIndex];
          if (item.id) {
            setFieldValue(`items[${fullIndex}]._destroy`, true);
          } else {
            remove(fullIndex);
          }
        };

        /* visibleItems: maps visible position → full-array index */
        const visibleItems: Array<{ item: IItem; fullIndex: number }> = (
          values.items as IItem[]
        )
          .map((item, fullIndex) => ({ item, fullIndex }))
          .filter(({ item }) => !item._destroy);

        /* translate visible positions → full-array indices before move() */
        const handleDragEnd = (result: DropResult) => {
          if (!result.destination) return;
          if (result.source.index === result.destination.index) return;

          const srcFull = visibleItems[result.source.index].fullIndex;
          const dstFull = visibleItems[result.destination.index].fullIndex;
          move(srcFull, dstFull);

          /* update seq after Formik commits the swap */
          setTimeout(() => {
            (form.values.items as IItem[]).forEach((item, i) => {
              if (!item._destroy) setFieldValue(`items[${i}].seq`, i + 1);
            });
          }, 0);
        };

        /* ── helper: does this type use a field? ─────────────── */
        const has = (type: string, field: string) => {
          switch (field) {
            case "alternatives":
              return type === "Multiple choice" || type === "Dropdown";
            case "column_names":
              return type === "Grid";
            case "row_names":
              return type === "Grid";
            case "min_label":
            case "max_label":
              return type === "Scale" || type === "Criterion";
            case "rows":
              return (
                type === "Criterion" ||
                type === "Text area" ||
                type === "Grid"
              );
            case "cols":
              return (
                type === "Criterion" ||
                type === "Text area" ||
                type === "Text field" ||
                type === "Grid"
              );
            case "weight":
              return (
                type === "Multiple choice" ||
                type === "Dropdown" ||
                type === "Scale" ||
                type === "Criterion"
              );
            default:
              return false;
          }
        };

        /* ── row-field name depends on type ──────────────────── */
        const rowFieldName = (type: string, fi: number) =>
          type === "Grid" ? `items[${fi}].rows` : `items[${fi}].textarea_height`;

        const colFieldName = (type: string, fi: number) => {
          if (type === "Grid") return `items[${fi}].columns`;
          if (type === "Text field") return `items[${fi}].textbox_width`;
          return `items[${fi}].textarea_width`;
        };

        return (
          <>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questionnaire-items">
                {(droppableProvided) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                  >
                    {visibleItems.map(({ item, fullIndex }, visiblePos) => (
                      <Draggable
                        key={
                          item.id != null ? `item-${item.id}` : `new-${fullIndex}`
                        }
                        draggableId={
                          item.id != null ? `item-${item.id}` : `new-${fullIndex}`
                        }
                        index={visiblePos}
                      >
                        {(dp, snap) => (
                          <div
                            ref={dp.innerRef}
                            {...dp.draggableProps}
                            style={{
                              ...dp.draggableProps.style,
                              background: snap.isDragging
                                ? "rgba(13,110,253,0.05)"
                                : "#ffffff",
                              border: snap.isDragging
                                ? "1.5px solid #0d6efd"
                                : "1px solid #e5e7eb",
                              borderRadius: "10px",
                              boxShadow: snap.isDragging
                                ? "0 8px 24px rgba(13,110,253,0.16)"
                                : "0 1px 3px rgba(0,0,0,0.06)",
                              transition: snap.isDragging
                                ? undefined
                                : "box-shadow 0.15s ease, border-color 0.15s ease",
                              overflow: "hidden",
                            }}
                          >
                            {/* ── Card header ── */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 12px",
                                background: snap.isDragging
                                  ? "rgba(13,110,253,0.06)"
                                  : "#f9fafb",
                                borderBottom: "1px solid #e5e7eb",
                                userSelect: "none",
                              }}
                            >
                              {/* Drag handle */}
                              <span
                                {...dp.dragHandleProps}
                                title="Drag to reorder"
                                aria-label="Drag to reorder"
                                style={{
                                  cursor: snap.isDragging ? "grabbing" : "grab",
                                  color: snap.isDragging ? "#0d6efd" : "#9ca3af",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "color 0.15s",
                                  flexShrink: 0,
                                }}
                              >
                                <FaGripVertical size={15} />
                              </span>

                              {/* Item number */}
                              {showNumbers && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#9ca3af",
                                    minWidth: "18px",
                                  }}
                                >
                                  {visiblePos + 1}
                                </span>
                              )}

                              {/* Type badge */}
                              <span style={typeBadgeStyle(item.question_type ?? "")}>
                                {item.question_type}
                              </span>

                              {/* Spacer */}
                              <div style={{ flex: 1 }} />

                              {/* Weight — inline in header if relevant */}
                              {has(item.question_type ?? "", "weight") && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#6b7280",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Weight
                                  </span>
                                  <Field
                                    name={`items[${fullIndex}].weight`}
                                    type="number"
                                    placeholder="0"
                                    className="form-control form-control-sm"
                                    style={{ width: "60px" }}
                                  />
                                </div>
                              )}

                              {/* Delete */}
                              <OverlayTrigger
                                overlay={<Tooltip>Remove item</Tooltip>}
                              >
                                <Button
                                  variant="link"
                                  onClick={() => handleRemove(fullIndex)}
                                  aria-label="Remove item"
                                  className="p-0 ms-1"
                                  style={{ lineHeight: 1 }}
                                >
                                  <img
                                    src="/assets/images/delete-icon-24.png"
                                    alt="remove"
                                    style={{ width: "20px", height: "20px" }}
                                  />
                                </Button>
                              </OverlayTrigger>
                            </div>

                            {/* ── Card body ── */}
                            <div style={{ padding: "12px 14px" }}>
                              {/* Prompt — full width */}
                              <div style={{ marginBottom: "10px" }}>
                                {fieldLabel("Prompt")}
                                <Field
                                  as="textarea"
                                  rows={2}
                                  name={`items[${fullIndex}].txt`}
                                  placeholder="Enter the prompt shown to the reviewer…"
                                  className="form-control form-control-sm"
                                  maxLength={100}
                                  style={{
                                    resize: "vertical",
                                    width: "100%",
                                  }}
                                />
                                <ErrorMessage
                                  name={`items[${fullIndex}].txt`}
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </div>

                              {/* Type-specific fields — responsive 2-col grid */}
                              {(has(item.question_type ?? "", "alternatives") ||
                                has(item.question_type ?? "", "column_names") ||
                                has(item.question_type ?? "", "row_names") ||
                                has(item.question_type ?? "", "min_label") ||
                                has(item.question_type ?? "", "max_label") ||
                                has(item.question_type ?? "", "rows") ||
                                has(item.question_type ?? "", "cols")) && (
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                    gap: "10px",
                                  }}
                                >
                                  {/* Choices (Multiple choice / Dropdown) */}
                                  {has(item.question_type ?? "", "alternatives") && (
                                    <div style={{ gridColumn: "1 / -1" }}>
                                      {fieldLabel("Choices (comma-separated)")}
                                      <Field
                                        name={`items[${fullIndex}].alternatives`}
                                        placeholder="e.g. Option A, Option B, Option C"
                                        className="form-control form-control-sm"
                                        style={{ width: "100%" }}
                                      />
                                      <ErrorMessage
                                        name={`items[${fullIndex}].alternatives`}
                                        component="div"
                                        className="text-danger small mt-1"
                                      />
                                    </div>
                                  )}

                                  {/* Row Names (Grid only) */}
                                  {has(item.question_type ?? "", "row_names") && (
                                    <div style={{ gridColumn: "1 / -1" }}>
                                      {fieldLabel("Row Names (comma-separated)")}
                                      <Field
                                        as="textarea"
                                        rows={2}
                                        name={`items[${fullIndex}].row_names`}
                                        placeholder="e.g. Clarity, Completeness, Correctness"
                                        className="form-control form-control-sm"
                                        style={{ width: "100%", resize: "vertical" }}
                                      />
                                    </div>
                                  )}

                                  {/* Column Names (Grid only) */}
                                  {has(item.question_type ?? "", "column_names") && (
                                    <div style={{ gridColumn: "1 / -1" }}>
                                      {fieldLabel("Column Names (comma-separated)")}
                                      <Field
                                        as="textarea"
                                        rows={2}
                                        name={`items[${fullIndex}].column_names`}
                                        placeholder="e.g. Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree"
                                        className="form-control form-control-sm"
                                        style={{ width: "100%", resize: "vertical" }}
                                      />
                                    </div>
                                  )}

                                  {/* Min Label */}
                                  {has(item.question_type ?? "", "min_label") && (
                                    <div>
                                      {fieldLabel("Min Label")}
                                      <Field
                                        name={`items[${fullIndex}].min_label`}
                                        placeholder="e.g. Strongly Disagree"
                                        className="form-control form-control-sm"
                                      />
                                    </div>
                                  )}

                                  {/* Max Label */}
                                  {has(item.question_type ?? "", "max_label") && (
                                    <div>
                                      {fieldLabel("Max Label")}
                                      <Field
                                        name={`items[${fullIndex}].max_label`}
                                        placeholder="e.g. Strongly Agree"
                                        className="form-control form-control-sm"
                                      />
                                    </div>
                                  )}

                                  {/* Rows */}
                                  {has(item.question_type ?? "", "rows") && (
                                    <div>
                                      {fieldLabel(
                                        item.question_type === "Grid"
                                          ? "Number of Rows"
                                          : "Height (rows)"
                                      )}
                                      <Field
                                        name={rowFieldName(
                                          item.question_type ?? "",
                                          fullIndex
                                        )}
                                        type="number"
                                        placeholder="e.g. 4"
                                        className="form-control form-control-sm"
                                        style={{ maxWidth: "120px" }}
                                      />
                                    </div>
                                  )}

                                  {/* Cols */}
                                  {has(item.question_type ?? "", "cols") && (
                                    <div>
                                      {fieldLabel(
                                        item.question_type === "Grid"
                                          ? "Number of Columns"
                                          : "Width (cols)"
                                      )}
                                      <Field
                                        name={colFieldName(
                                          item.question_type ?? "",
                                          fullIndex
                                        )}
                                        type="number"
                                        placeholder="e.g. 5"
                                        className="form-control form-control-sm"
                                        style={{ maxWidth: "120px" }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {droppableProvided.placeholder}

                    {visibleItems.length === 0 && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "32px 16px",
                          color: "#9ca3af",
                          border: "2px dashed #e5e7eb",
                          borderRadius: "10px",
                          fontSize: "14px",
                        }}
                      >
                        No items yet. Use the controls below to add items.
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* ── Add items toolbar ── */}
            <div
              className="d-flex gap-2 align-items-center flex-wrap mt-3 pt-3"
              style={{ borderTop: "1px solid #e5e7eb" }}
            >
              <button
                type="button"
                className="btn btn-outline-primary btn-sm fw-semibold px-3"
                disabled={!itemType || !numItems}
                onClick={() => {
                  const count = typeof numItems === "number" ? numItems : 0;
                  for (let i = 0; i < count; i++) {
                    const isGrid = itemType === "Grid";
                    push({
                      id: undefined,
                      txt: isGrid
                        ? "Please rate the following aspects of the submission:"
                        : "",
                      weight: "",
                      question_type: itemType,
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
                      seq: values.items.length + i + 1,
                    });
                  }
                  setNumItems("");
                  setItemType("");
                }}
              >
                <FaPlus className="me-1" style={{ marginBottom: "2px" }} />
                Add
              </button>

              <OverlayTrigger overlay={<Tooltip>How many items to add at once</Tooltip>}>
                <Field
                  type="number"
                  name="numItems"
                  placeholder="#"
                  value={numItems}
                  min={1}
                  max={20}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNumItems(Number(e.target.value))
                  }
                  className="form-control form-control-sm"
                  style={{ width: "64px" }}
                />
              </OverlayTrigger>

              <select
                className="form-control form-control-sm"
                value={itemType}
                style={{ width: "180px" }}
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="">— Select item type —</option>
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <span className="text-muted small">items</span>

              <div className="form-check ms-2 mb-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showNumbersToggle"
                  checked={showNumbers}
                  onChange={(e) => setShowNumbers(e.target.checked)}
                />
                <label
                  htmlFor="showNumbersToggle"
                  className="form-check-label small fw-semibold"
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

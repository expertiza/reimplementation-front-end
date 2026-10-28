import React, { useState } from "react";
import { Field, FieldArray, FieldArrayRenderProps, ErrorMessage } from "formik";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { FaPlus, FaGripVertical } from "react-icons/fa";
import { IItem } from "./QuestionnaireUtils";

interface Props {
  values: any;
  errors?: any;
  touched?: any;
  itemTypes: string[];
}

/* ── which types use each optional field ─────────────────────── */
const TYPES_WITH_ALTERNATIVES = new Set(["Multiple choice", "Dropdown"]);
const TYPES_WITH_GRID         = new Set(["Grid"]);
const TYPES_WITH_MIN_MAX      = new Set(["Scale", "Criterion"]);
const TYPES_WITH_ROWS         = new Set(["Criterion", "Text area", "Grid"]);
const TYPES_WITH_COLS         = new Set(["Criterion", "Text area", "Text field", "Grid"]);
const TYPES_WITH_WEIGHT       = new Set(["Multiple choice", "Dropdown", "Scale", "Criterion"]);

/* ── style constants ─────────────────────────────────────────── */
const TH: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#6b7280",
  background: "#f9fafb",
  padding: "8px 10px",
  borderBottom: "2px solid #e5e7eb",
  verticalAlign: "bottom",
  boxSizing: "border-box",
  whiteSpace: "normal",
  lineHeight: "1.3",
};

const subTH: React.CSSProperties = {
  fontWeight: 400,
  fontSize: "11px",
  color: "#9ca3af",
  textTransform: "none",
  letterSpacing: "normal",
  marginTop: "2px",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  padding: "8px 10px",
  verticalAlign: "top",
  borderBottom: "1px solid #f3f4f6",
};

/* ── helpers ─────────────────────────────────────────────────── */
const rowFieldName = (type: string, fi: number) =>
  type === "Grid" ? `items[${fi}].rows` : `items[${fi}].textarea_height`;

const colFieldName = (type: string, fi: number) => {
  if (type === "Grid")       return `items[${fi}].columns`;
  if (type === "Text field") return `items[${fi}].textbox_width`;
  return `items[${fi}].textarea_width`;
};

/* ────────────────────────────────────────────────────────────── */
const QuestionnaireItemsFieldArray: React.FC<Props> = ({
  values,
  itemTypes,
}) => {
  const [itemType, setItemType]   = useState("");
  const [numItems, setNumItems]   = useState<number | "">(1);
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

        /* visible slice: maps visible position → full-array index */
        const visible: Array<{ item: IItem; fullIndex: number }> = (
          values.items as IItem[]
        )
          .map((item, fullIndex) => ({ item, fullIndex }))
          .filter(({ item }) => !item._destroy);

        /* drag: map visible positions back to full-array indices */
        const handleDragEnd = (result: DropResult) => {
          if (!result.destination) return;
          if (result.source.index === result.destination.index) return;
          const src = visible[result.source.index].fullIndex;
          const dst = visible[result.destination.index].fullIndex;
          move(src, dst);
          setTimeout(() => {
            (form.values.items as IItem[]).forEach((item, i) => {
              if (!item._destroy) setFieldValue(`items[${i}].seq`, i + 1);
            });
          }, 0);
        };

        /* ── which optional columns are needed? ─────────────── */
        const activeTypes = new Set(visible.map(({ item }) => item.item_type ?? item.question_type ?? ""));

        const showAlternatives = [...activeTypes].some((t) => TYPES_WITH_ALTERNATIVES.has(t));
        const showRowNames     = [...activeTypes].some((t) => TYPES_WITH_GRID.has(t));
        const showColNames     = [...activeTypes].some((t) => TYPES_WITH_GRID.has(t));
        const showMinMax       = [...activeTypes].some((t) => TYPES_WITH_MIN_MAX.has(t));
        const showRows         = [...activeTypes].some((t) => TYPES_WITH_ROWS.has(t));
        const showCols         = [...activeTypes].some((t) => TYPES_WITH_COLS.has(t));
        const showWeight       = [...activeTypes].some((t) => TYPES_WITH_WEIGHT.has(t));

        /* Calculate visible column count */
        let columnCount = 4; // grip, type, prompt, del
        if (showNumbers) columnCount += 1;
        if (showAlternatives) columnCount += 1;
        if (showRowNames) columnCount += 1;
        if (showColNames) columnCount += 1;
        if (showMinMax) columnCount += 2; // min_label, max_label
        if (showRows) columnCount += 1;
        if (showCols) columnCount += 1;
        if (showWeight) columnCount += 1;

        /* Only expand to full window space when needed (9+ columns from diverse items).
           When there are fewer columns, keep the table proportionally compact. */
        const isFullWidthNeeded = columnCount >= 9;
        const isMediumWidth     = columnCount === 8;
        const tableMaxWidth     = isFullWidthNeeded ? "100%" : isMediumWidth ? "1200px" : "960px";

        /* shared textarea style */
        const taStyle: React.CSSProperties = {
          resize: "vertical",
          minHeight: "52px",
          width: "100%",
          fontSize: "13px",
        };

        return (
          <>
            {/* ── Items table ── */}
            <style>{`
              .qifa-scroll-wrapper::-webkit-scrollbar { display: none; }
            `}</style>
            {visible.length > 0 ? (
              <div
                className="qifa-scroll-wrapper"
                style={{
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  marginBottom: "4px",
                  width: "100%",
                  maxWidth: tableMaxWidth,
                  margin: "0 auto",
                  transition: "max-width 0.2s ease-in-out",
                }}
              >
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="questionnaire-items">
                    {(droppableProvided) => (
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "13px",
                          tableLayout: "auto",
                        }}
                      >
                        {/* ── Header ── */}
                        <thead>
                          <tr>
                            {/* grip */}
                            <th style={{ ...TH, width: "32px", minWidth: "32px", padding: "8px 6px" }} />
                            {/* # */}
                            {showNumbers && (
                              <th style={{ ...TH, width: "36px", minWidth: "36px", textAlign: "center" }}>#</th>
                            )}
                            {/* type */}
                            <th style={{ ...TH, width: "110px", minWidth: "100px" }}>Type</th>
                            {/* prompt */}
                            <th style={{ ...TH, minWidth: "180px" }}>Prompt</th>
                            {/* optional columns */}
                            {showAlternatives && (
                              <th style={{ ...TH, width: "14%", minWidth: "120px" }}>
                                <div>Choices</div>
                                <div style={subTH}>(comma-separated)</div>
                              </th>
                            )}
                            {showRowNames && (
                              <th style={{ ...TH, width: "14%", minWidth: "120px" }}>
                                <div>Row Names</div>
                                <div style={subTH}>(comma-separated)</div>
                              </th>
                            )}
                            {showColNames && (
                              <th style={{ ...TH, width: "14%", minWidth: "120px" }}>
                                <div>Column Names</div>
                                <div style={subTH}>(comma-separated)</div>
                              </th>
                            )}
                            {showMinMax && (
                              <>
                                <th style={{ ...TH, width: "90px", minWidth: "80px" }}>Min Label</th>
                                <th style={{ ...TH, width: "90px", minWidth: "80px" }}>Max Label</th>
                              </>
                            )}
                            {showRows && (
                              <th style={{ ...TH, width: "54px", minWidth: "48px", textAlign: "center" }}>
                                <OverlayTrigger
                                  overlay={
                                    <Tooltip>
                                      Height (rows) — Criterion, Text area, Grid
                                    </Tooltip>
                                  }
                                >
                                  <span style={{ cursor: "help", borderBottom: "1px dotted #9ca3af" }}>Rows</span>
                                </OverlayTrigger>
                              </th>
                            )}
                            {showCols && (
                              <th style={{ ...TH, width: "54px", minWidth: "48px", textAlign: "center" }}>
                                <OverlayTrigger
                                  overlay={
                                    <Tooltip>
                                      Width (cols) — Criterion, Text area, Text field, Grid
                                    </Tooltip>
                                  }
                                >
                                  <span style={{ cursor: "help", borderBottom: "1px dotted #9ca3af" }}>Cols</span>
                                </OverlayTrigger>
                              </th>
                            )}
                            {showWeight && (
                              <th style={{ ...TH, width: "58px", minWidth: "50px", textAlign: "center" }}>Weight</th>
                            )}
                            {/* delete */}
                            <th style={{ ...TH, width: "40px", minWidth: "36px", textAlign: "center" }}>Del</th>
                          </tr>
                        </thead>

                        {/* ── Body ── */}
                        <tbody
                          ref={droppableProvided.innerRef}
                          {...droppableProvided.droppableProps}
                        >
                          {visible.map(({ item, fullIndex }, visiblePos) => (
                            <Draggable
                              key={item.id != null ? `item-${item.id}` : `new-${fullIndex}`}
                              draggableId={item.id != null ? `item-${item.id}` : `new-${fullIndex}`}
                              index={visiblePos}
                            >
                              {(dp, snap) => {
                                const rowBg = snap.isDragging
                                  ? "rgba(13,110,253,0.06)"
                                  : visiblePos % 2 === 0
                                  ? "#ffffff"
                                  : "#fafafa";

                                const type = item.item_type ?? item.question_type ?? "";

                                return (
                                  <tr
                                    ref={dp.innerRef}
                                    {...dp.draggableProps}
                                    style={{
                                      ...dp.draggableProps.style,
                                      background: rowBg,
                                      boxShadow: snap.isDragging
                                        ? "0 6px 20px rgba(13,110,253,0.14)"
                                        : undefined,
                                      outline: snap.isDragging
                                        ? "1.5px solid #0d6efd"
                                        : undefined,
                                      borderRadius: snap.isDragging ? "6px" : undefined,
                                      transition: snap.isDragging ? undefined : "background 0.1s",
                                    }}
                                  >
                                    {/* Drag grip */}
                                    <td
                                      {...dp.dragHandleProps}
                                      style={{
                                        ...TD,
                                        width: "32px",
                                        textAlign: "center",
                                        cursor: snap.isDragging ? "grabbing" : "grab",
                                        color: snap.isDragging ? "#0d6efd" : "#d1d5db",
                                        paddingTop: "12px",
                                        transition: "color 0.15s",
                                      }}
                                      title="Drag to reorder"
                                    >
                                      <FaGripVertical size={14} />
                                    </td>

                                    {/* # */}
                                    {showNumbers && (
                                      <td
                                        style={{
                                          ...TD,
                                          textAlign: "center",
                                          fontWeight: 600,
                                          color: "#9ca3af",
                                          fontSize: "12px",
                                          paddingTop: "14px",
                                        }}
                                      >
                                        {visiblePos + 1}
                                      </td>
                                    )}

                                    {/* Type */}
                                    <td style={{ ...TD, paddingTop: "12px" }}>
                                      <span
                                        style={{
                                          fontWeight: 600,
                                          fontSize: "12px",
                                          color: "#374151",
                                        }}
                                      >
                                        {type}
                                      </span>
                                    </td>

                                    {/* Prompt */}
                                    <td style={TD}>
                                      <Field
                                        as="textarea"
                                        name={`items[${fullIndex}].txt`}
                                        placeholder="Enter prompt / statement…"
                                        className="form-control form-control-sm"
                                        maxLength={100}
                                        style={{ ...taStyle, minHeight: "34px" }}
                                      />
                                      <ErrorMessage
                                        name={`items[${fullIndex}].txt`}
                                        render={(msg) => (
                                          <div
                                            className="text-danger"
                                            style={{ fontSize: "11px", marginTop: "2px" }}
                                          >
                                            {msg}
                                          </div>
                                        )}
                                      />
                                    </td>

                                    {/* Choices (Multiple choice / Dropdown) */}
                                    {showAlternatives && (
                                      <td style={TD}>
                                        {TYPES_WITH_ALTERNATIVES.has(type) ? (
                                          <>
                                            <Field
                                              as="textarea"
                                              name={`items[${fullIndex}].alternatives`}
                                              placeholder="A, B, C, …"
                                              className="form-control form-control-sm"
                                              style={taStyle}
                                            />
                                            <ErrorMessage
                                              name={`items[${fullIndex}].alternatives`}
                                              render={(msg) => (
                                                <div
                                                  className="text-danger"
                                                  style={{ fontSize: "11px", marginTop: "2px" }}
                                                >
                                                  {msg}
                                                </div>
                                              )}
                                            />
                                          </>
                                        ) : (
                                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                                        )}
                                      </td>
                                    )}

                                    {/* Row Names (Grid) */}
                                    {showRowNames && (
                                      <td style={TD}>
                                        {TYPES_WITH_GRID.has(type) ? (
                                          <Field
                                            as="textarea"
                                            name={`items[${fullIndex}].row_names`}
                                            placeholder="Clarity, Completeness, …"
                                            className="form-control form-control-sm"
                                            style={taStyle}
                                          />
                                        ) : (
                                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                                        )}
                                      </td>
                                    )}

                                    {/* Column Names (Grid) or merged column */}
                                    {(showColNames) && (
                                      <td style={TD}>
                                        {TYPES_WITH_GRID.has(type) ? (
                                          <Field
                                            as="textarea"
                                            name={`items[${fullIndex}].column_names`}
                                            placeholder="Strongly Disagree, …, Strongly Agree"
                                            className="form-control form-control-sm"
                                            style={taStyle}
                                          />
                                        ) : (
                                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                                        )}
                                      </td>
                                    )}

                                    {/* Min Label */}
                                    {showMinMax && (
                                      <td style={TD}>
                                        {TYPES_WITH_MIN_MAX.has(type) ? (
                                          <Field
                                            as="textarea"
                                            name={`items[${fullIndex}].min_label`}
                                            placeholder="e.g. Poor"
                                            className="form-control form-control-sm"
                                            style={{ color: "#212529", width: "100%", resize: "vertical", minHeight: "52px" }}
                                          />
                                        ) : (
                                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                                        )}
                                      </td>
                                    )}

                                    {/* Max Label */}
                                    {showMinMax && (
                                      <td style={TD}>
                                        {TYPES_WITH_MIN_MAX.has(type) ? (
                                          <Field
                                            as="textarea"
                                            name={`items[${fullIndex}].max_label`}
                                            placeholder="e.g. Excellent"
                                            className="form-control form-control-sm"
                                            style={{ color: "#212529", width: "100%", resize: "vertical", minHeight: "52px" }}
                                          />
                                        ) : (
                                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                                        )}
                                      </td>
                                    )}

                                    {/* Rows */}
                                    {showRows && (
                                      <td style={{ ...TD, textAlign: "center", verticalAlign: "middle" }}>
                                        {TYPES_WITH_ROWS.has(type) ? (
                                          <Field
                                            name={rowFieldName(type, fullIndex)}
                                            type="number"
                                            placeholder="—"
                                            className="form-control form-control-sm text-center"
                                            style={{ width: "56px", display: "block", margin: "0 auto" }}
                                          />
                                        ) : (
                                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                                        )}
                                      </td>
                                    )}

                                    {/* Cols */}
                                    {showCols && (
                                      <td style={{ ...TD, textAlign: "center", verticalAlign: "middle" }}>
                                        {TYPES_WITH_COLS.has(type) ? (
                                          <Field
                                            name={colFieldName(type, fullIndex)}
                                            type="number"
                                            placeholder="—"
                                            className="form-control form-control-sm text-center"
                                            style={{ width: "56px", display: "block", margin: "0 auto" }}
                                          />
                                        ) : (
                                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                                        )}
                                      </td>
                                    )}

                                    {/* Weight */}
                                    {showWeight && (
                                      <td style={{ ...TD, textAlign: "center", verticalAlign: "middle" }}>
                                        {TYPES_WITH_WEIGHT.has(type) ? (
                                          <>
                                            <Field
                                              name={`items[${fullIndex}].weight`}
                                              type="number"
                                              placeholder="—"
                                              className="form-control form-control-sm text-center"
                                              style={{ width: "60px", display: "block", margin: "0 auto" }}
                                            />
                                            <ErrorMessage
                                              name={`items[${fullIndex}].weight`}
                                              render={(msg) => (
                                                <div
                                                  className="text-danger"
                                                  style={{ fontSize: "11px", marginTop: "2px" }}
                                                >
                                                  {msg}
                                                </div>
                                              )}
                                            />
                                          </>
                                        ) : (
                                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                                        )}
                                      </td>
                                    )}

                                    {/* Delete */}
                                    <td style={{ ...TD, textAlign: "center", verticalAlign: "middle" }}>
                                      <OverlayTrigger overlay={<Tooltip>Remove item</Tooltip>}>
                                        <Button
                                          variant="link"
                                          onClick={() => handleRemove(fullIndex)}
                                          aria-label="Remove item"
                                          className="p-0"
                                          style={{ lineHeight: 1 }}
                                        >
                                          <img
                                            src="/assets/images/delete-icon-24.png"
                                            alt="remove"
                                            style={{ width: "20px", height: "20px" }}
                                          />
                                        </Button>
                                      </OverlayTrigger>
                                    </td>
                                  </tr>
                                );
                              }}
                            </Draggable>
                          ))}
                          {droppableProvided.placeholder}
                        </tbody>
                      </table>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "28px 16px",
                  color: "#9ca3af",
                  border: "2px dashed #e5e7eb",
                  borderRadius: "10px",
                  marginBottom: "12px",
                  fontSize: "14px",
                  maxWidth: tableMaxWidth,
                  margin: "0 auto 12px auto",
                  transition: "max-width 0.2s ease-in-out",
                }}
              >
                No items yet — use the controls below to add some.
              </div>
            )}

            {/* ── Add toolbar ── */}
            <div
              className="d-flex gap-2 align-items-center flex-wrap mt-3 pt-3"
              style={{ borderTop: "1px solid #f3f4f6", maxWidth: tableMaxWidth, margin: "0 auto", transition: "max-width 0.2s ease-in-out" }}
            >
              <select
                className="form-control form-control-sm"
                value={itemType}
                style={{ width: "190px" }}
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="">— Select item type —</option>
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <OverlayTrigger overlay={<Tooltip>Number of items to add</Tooltip>}>
                <input
                  type="number"
                  placeholder="1"
                  value={numItems}
                  min={1}
                  max={20}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value;
                    if (val === "") {
                      setNumItems("");
                    } else {
                      const parsed = parseInt(val, 10);
                      setNumItems(isNaN(parsed) ? "" : parsed);
                    }
                  }}
                  onBlur={() => {
                    if (!numItems || numItems < 1) {
                      setNumItems(1);
                    }
                  }}
                  className="form-control form-control-sm text-center"
                  style={{ width: "56px" }}
                />
              </OverlayTrigger>

              <span style={{ fontSize: "13px", color: "#6b7280" }}>items</span>

              <button
                type="button"
                className="btn btn-outline-primary btn-sm fw-semibold px-3"
                disabled={!itemType}
                onClick={() => {
                  const count =
                    typeof numItems === "number" && numItems > 0 ? numItems : 1;
                  for (let i = 0; i < count; i++) {
                    const isGrid = itemType === "Grid";
                    push({
                      id: undefined,
                      txt: isGrid
                        ? "Please rate the following aspects of the submission:"
                        : "",
                      weight: "",
                      item_type: itemType,
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
                  setItemType("");
                  setNumItems(1);
                }}
              >
                <FaPlus style={{ marginBottom: "2px", marginRight: "4px" }} />
                Add
              </button>

              <div className="form-check ms-3 mb-0">
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
                  style={{ cursor: "pointer" }}
                >
                  Show numbers
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

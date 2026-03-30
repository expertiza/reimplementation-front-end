import React, { useState } from "react";
import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  ErrorMessage,
} from "formik";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { IItem } from "./QuestionnaireUtils";

interface Props {
  values: any;
  errors: any;
  touched: any;
  itemTypes: string[];
}

function visibleItemCount(items: IItem[]): number {
  return items.filter((i) => !i._destroy).length;
}

function parseBulkAddCount(raw: number | ""): number {
  if (raw === "") return 0;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) return 0;
  return Math.floor(raw);
}

const QuestionnaireItemsFieldArray: React.FC<Props> = ({
  values,
  errors,
  touched,
  itemTypes
}) => {
  const [questionType, setQuestionType] = useState("");
  const [numQuestions, setNumQuestions] = useState<number | "">("");
  const [showNumbers, setShowNumbers] = useState(false);
  const [addRowHint, setAddRowHint] = useState<string | null>(null);

  return (
    <FieldArray name="items">
      {({ push, remove, move, form }: FieldArrayRenderProps) => {
    const { setFieldValue } = form;
      return(
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
                  {values.items.length > 0 &&
                    values.items.map((item: IItem, index: number) => ({ item, index })).filter(({ item }: { item: IItem }) => !item._destroy).map(({ item, index }: { item: IItem; index: number }) => (
                      <Draggable
                      key={item.id ?? `new-${index}`}
                      draggableId={(item.id ?? `new-${index}`).toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`px-1 py-1 mb-1 rounded ${
                              snapshot.isDragging
                                ? "bg-light border border-primary"
                                : "bg-white border"
                            }`}
                           >
                           
                            <div className="d-flex gap-1 align-items-center ">
                             

                              

                              {showNumbers && (
                                <span style={{ width:"15px", fontSize: "14px"}} className="fw-semibold">{index + 1}.</span>
                                
                              )}


                             <span
    style={{ fontSize: "14px", width: "100px" }}
    className="fw-semibold flex-shrink-0"
  >
    {item.question_type}
  </span>
   <Field
  name={`items[${index}].txt`}
  placeholder="Item text"
  className="form-control"
  maxLength={100}
  style={{ width: "220px" }}
/>

                              {item.question_type === "Multiple choice" ||
                              item.question_type === "Dropdown" ||
                              item.question_type === "multiple_choice" ||
                              item.question_type === "dropdown" ? (
                                <>
                                 
                                  <Field
                                    name={`items[${index}].alternatives`}
                                    placeholder="Choices (comma-separated)"
                                    className="form-control"
                                    style={{ width: "245px" }}
                                  />
                                  <Field
                                    name={`items[${index}].weight`}
                                    type="number"
                                    placeholder="Wt."
                                    maxLength={3}
                                    className="form-control"
                                    style={{ width: "60px" }} 
                                  />
                                  <div className="ms-auto">
                                  <OverlayTrigger overlay={<Tooltip>Remove Item</Tooltip>}>
          <Button
            variant="link"
            onClick={() => {
    const item = values.items[index];
    if (item.id) {
      setFieldValue(`items[${index}]._destroy`, true);
    } else{
      remove(index);}
  }}
            aria-label="Remove Item"
            className="p-0"
          >
            <img
              src={"/assets/images/delete-icon-24.png"}
              alt="remove item"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger></div>
                                </>
                              ) : item.question_type === "Scale" || item.question_type === "scale" ? (
                                <>
                                  <Field
                                    name={`items[${index}].min_label`}
                                    placeholder="Min Label"
                                    className="form-control"
                                    style={{ width: "120px" }} 
                                  />
                                  <Field
                                    name={`items[${index}].max_label`}
                                    placeholder="Max Label"
                                    className="form-control"
                                    style={{ width: "120px" }} 
                                  />
                                  <Field
                                    name={`items[${index}].weight`}
                                    type="number"
                                    placeholder="Wt."
                                    maxLength={3}
                                    className="form-control"
                                    style={{ width: "60px" }} 
                                  />
                                  <div className="ms-auto">
                                  <OverlayTrigger overlay={<Tooltip>Remove Item</Tooltip>}>
          <Button
            variant="link"
            onClick={() => {
    const item = values.items[index];
    if (item.id) {
      setFieldValue(`items[${index}]._destroy`, true);
    } 
      else{
      remove(index);}
  }}
            aria-label="Remove Item"
            className="p-0"
          >
            <img
              src={"/assets/images/delete-icon-24.png"}
              alt="remove item"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger></div>
                                </>
                              ) : item.question_type === "Criterion" ? (
                                <>
                                  <Field
                                    name={`items[${index}].textarea_width`}
                                    type="number"
                                    placeholder="Wd."
                                    className="form-control"
                                    style={{ width: "60px" }}
                                  />
                                  <Field
                                    name={`items[${index}].textarea_height`}
                                    type="number"
                                    placeholder="Ht."
                                    className="form-control"
                                    style={{ width: "60px" }}
                                  />
                                  <Field
                                    name={`items[${index}].min_label`}
                                    placeholder="Min Label"
                                    className="form-control"
                                    style={{ width: "100px" }}
                                  />
                                  <Field
                                    name={`items[${index}].max_label`}
                                    placeholder="Max Label"
                                    className="form-control"
                                    style={{ width: "100px" }}
                                  />
                                  <Field
                                    name={`items[${index}].weight`}
                                    type="number"
                                    placeholder="Wt."
                                    className="form-control"
                                    style={{ width: "60px" }}
                                  />
				  <div className="ms-auto">
                                  <OverlayTrigger overlay={<Tooltip>Remove Item</Tooltip>}>
          <Button
            variant="link"
            onClick={() => {
    const item = values.items[index];
    if (item.id) {
      setFieldValue(`items[${index}]._destroy`, true);
    } 
      else{
      remove(index);}
  }}
            aria-label="Remove Item"
            className="p-0"
          >
            <img
              src={"/assets/images/delete-icon-24.png"}
              alt="remove item"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger></div>
                                </>
                            ) : item.question_type === "Text field" || item.question_type === "TextField" ? (<>
                                  <Field
                                    name={`items[${index}].textbox_width`}
                                    type="number"
                                    placeholder="Wd."
                                    className="form-control"
                                    style={{ width: "60px" }}
                                  />
                                  <div className="ms-auto">
                                  <OverlayTrigger overlay={<Tooltip>Remove Item</Tooltip>}>
          <Button
            variant="link"
            onClick={() => {
    const item = values.items[index];
    if (item.id) {
     setFieldValue(`items[${index}]._destroy`, true);
    } 
     else{
      remove(index);}
  }}
            aria-label="Remove Item"
            className="p-0"
          >
            <img
              src={"/assets/images/delete-icon-24.png"}
              alt="remove item"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger></div>
                                </>): item.question_type === "Text area" || item.question_type === "TextArea" ? (
                                  <>
                                  <Field
                                    name={`items[${index}].textarea_width`}
                                    type="number"
                                    placeholder="Wd."
                                    className="form-control"
                                    style={{ width: "60px" }}
                                  />
                                  <Field
                                    name={`items[${index}].textarea_height`}
                                    type="number"
                                    placeholder="Ht."
                                    className="form-control"
                                    style={{ width: "60px" }}
                                  />
                                  <div className="ms-auto">
                                  <OverlayTrigger overlay={<Tooltip>Remove Item</Tooltip>}>
          <Button
            variant="link"
            onClick={() => {
    const item = values.items[index];
    if (item.id) {
      setFieldValue(`items[${index}]._destroy`, true);
    } 
      else{
      remove(index);}
  }}
            aria-label="Remove Item"
            className="p-0"
          >
            <img
              src={"/assets/images/delete-icon-24.png"}
              alt="remove item"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger></div>
                                </>
                                ) : item.question_type === "Grid" ?(
                                  <>
                                  <Field
                                    name={`items[${index}].col_names`}
                                    placeholder="Columns (comma-separated)"
                                    className="form-control"
                                    style={{ width: "200px" }}
                                  />
                                  <Field
                                    name={`items[${index}].row_names`}
                                    placeholder="Rows (comma-separated)"
                                    className="form-control"
                                    style={{ width: "200px" }}
                                  />
 <div className="ms-auto">
                                  <OverlayTrigger overlay={<Tooltip>Remove Item</Tooltip>}>
          <Button
            variant="link"
            onClick={() => {
    const item = values.items[index];
    if (item.id) {
      setFieldValue(`items[${index}]._destroy`, true);
    } 
      else{
      remove(index);}
  }}
            aria-label="Remove Item"
            className="p-0"
          >
            <img
              src={"/assets/images/delete-icon-24.png"}
              alt="remove item"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger></div>
                                  
                                  
                                  </>
                                )                           
                              : (
                                <>
                           <div className="ms-auto">      
<OverlayTrigger overlay={<Tooltip>Remove Item</Tooltip>}>
          <Button
            variant="link"
            onClick={() => {
    const item = values.items[index];
    if (item.id) {
      setFieldValue(`items[${index}]._destroy`, true);
    } 
      else{
      remove(index);}
  }}
            aria-label="Remove Item"
            className="p-0"
          >
            <img
              src={"/assets/images/delete-icon-24.png"}
              alt="remove item"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger>
        </div>
                                </>
                              )}
                            </div>

                            <ErrorMessage
                              name={`items[${index}].txt`}
                              component="div"
                              className="text-danger"
                            />
                            <ErrorMessage
                              name={`items[${index}].alternatives`}
                              component="div"
                              className="text-danger"
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>


          <p className="text-muted small mb-2">
            Choose how many rows to add and the item type, then click <strong>Add</strong>. Fill the text for each
            rubric row, then click <strong>Save</strong> at the bottom.
          </p>
          <div className="d-flex flex-wrap align-items-start gap-2 mb-1">
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                if (!questionType.trim()) {
                  setAddRowHint("Select an item type before adding.");
                  return;
                }
                const questionCount = parseBulkAddCount(numQuestions);
                if (questionCount < 1) {
                  setAddRowHint("Enter a number of items (1 or more) in the box next to Add.");
                  return;
                }
                setAddRowHint(null);
                const base = visibleItemCount(values.items || []);
                for (let i = 0; i < questionCount; i++) {
                  push({
                    id: undefined,
                    txt: "",
                    weight: 1,
                    question_type: questionType,
                    break_before: true,
                    alternatives: "",
                    min_label: "Strongly disagree",
                    max_label: "Strongly agree",
                    seq: base + i + 1,
                  });
                }
                setNumQuestions("");
                setQuestionType("");
              }}
            >
              Add
            </button>
            <span title="How many items?">
              {/* Plain input: a Formik Field named numQuestions fought local state and could clear the count. */}
              <input
                type="number"
                min={1}
                placeholder="#"
                value={numQuestions === "" ? "" : numQuestions}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = e.target.value;
                  if (v === "") {
                    setNumQuestions("");
                  } else {
                    const n = Number(v);
                    setNumQuestions(Number.isFinite(n) ? n : "");
                  }
                  setAddRowHint(null);
                }}
                className="form-control"
                style={{ width: "72px" }}
              />
            </span>
            <select
              className="form-control"
              value={questionType}
              style={{ width: "140px" }}
              onChange={(e) => {
                setQuestionType(e.target.value);
                setAddRowHint(null);
              }}
            >
              <option value="">- Select item type -</option>
              {itemTypes.map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}
            </select>
            <div className="fw-semibold pt-2"> items </div>
            
            <div className="form-check ms-3 pt-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="showNumbersToggle"
                checked={showNumbers}
                onChange={(e) => setShowNumbers(e.target.checked)}
              />
              <span style={{ fontSize: "14px"}} className="fw-semibold">Show item numbers</span>
            </div>
          </div>
          {addRowHint && <div className="text-danger small mb-2">{addRowHint}</div>}
        </>
      )}}
    </FieldArray>
  );
};

export default QuestionnaireItemsFieldArray;

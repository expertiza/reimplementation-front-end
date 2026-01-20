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

const QuestionnaireItemsFieldArray: React.FC<Props> = ({
  values,
  errors,
  touched,
  itemTypes
}) => {
  const [questionType, setQuestionType] = useState("");
  const [numQuestions, setNumQuestions] = useState<number | "">("");
   const [showNumbers, setShowNumbers] = useState(false);

  

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
                              item.question_type === "Dropdown" ? (
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
                              ) : item.question_type === "Scale" ? (
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
                            ) : item.question_type === "Text field" ? (<>
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
                                </>): item.question_type === "Text area" ? (
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


          <div className="d-flex gap-2 mb-3">
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                const questionCount =
                  typeof numQuestions === "number" ? numQuestions : 0;

                for (let i = 0; i < questionCount; i++) {
                  push({
                    id: undefined,
                    txt: "",
                    weight: "",
                    question_type: questionType,
                    break_before: 1,
                    alternatives: "",
                    min_label: "",
                    max_label: "",
                    seq: values.items.length + 1,
                  });
                }
                setNumQuestions("");
                setQuestionType("");
              }}
            >
              Add
            </button>
                        <span  title="How many items?">

            <Field
  type="number"
  name="numQuestions"
  placeholder="#"
  value={numQuestions}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    setNumQuestions(Number(e.target.value))
  }
  className="form-control"
  maxLength={3}
  style={{ width: "60px" }} 
/></span>
            <select
              className="form-control"
              value={questionType}
  style={{ width: "140px" }}
              onChange={(e) => setQuestionType(e.target.value)}
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
        </>
      )}}
    </FieldArray>
  );
};

export default QuestionnaireItemsFieldArray;

import axiosClient from "../../utils/axios_client";
import { IEditor } from "../../utils/interfaces";
import { QuestionnaireFormValues , transformQuestionnaireRequest } from "./QuestionnaireUtils";
import React, { useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { Col, Container, Row } from 'react-bootstrap';
import QuestionnaireForm from "./QuestionnaireForm";
import { useDispatch, useSelector} from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";


const mapItemToFormField = (item: any) => {
  const qType: string = item.question_type ?? "";
  const sizeStr = item.size ? String(item.size) : "";
  const altStr  = item.alternatives ? String(item.alternatives) : "";

  let textarea_width: number | string = "";
  let textarea_height: number | string = "";
  let textbox_width: number | string = "";
  let column_names = "";
  let row_names = "";
  let columns: number | string = "";
  let rows: number | string = "";

  if (qType === "Text area" || qType === "Criterion") {
    const parts = sizeStr.split(",");
    textarea_width  = parts[0] || "";
    textarea_height = parts[1] || "";
  } else if (qType === "Text field") {
    textbox_width = sizeStr;
  } else if (qType === "Grid") {
    // Parse labels from alternatives
    const altParts = altStr.split("|");
    column_names = altParts[0] ?? "";
    row_names    = altParts[1] ?? "";
    // Parse numeric grid dimensions from size
    const sizeParts = sizeStr.split(",");
    const parsedCols = parseInt(sizeParts[0], 10);
    const parsedRows = parseInt(sizeParts[1], 10);
    columns = !isNaN(parsedCols) && parsedCols > 0 ? parsedCols : "";
    rows    = !isNaN(parsedRows) && parsedRows > 0 ? parsedRows : "";
  }

  return {
    id: item.id,
    txt: item.txt ?? "",
    question_type: qType,
    weight: item.weight ?? "",
    alternatives: altStr,
    min_label: item.min_label ?? "",
    max_label: item.max_label ?? "",
    textarea_width,
    textarea_height,
    textbox_width,
    column_names,
    row_names,
    columns,
    rows,
    seq: item.seq,
    break_before: item.break_before,
    _destroy: item._destroy || false,
  };
};

const QuestionnaireEditor: React.FC<IEditor> = ({ mode }) => {
  const token = localStorage.getItem("token");
  const questionnaire: any = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const type = searchParams.get("type");

  // Use items already returned by the loader; fall back to a separate fetch
  // only if the loader didn't include them (older backend behaviour).
  const loaderItems: any[] = useMemo(
    () => (questionnaire?.items ?? []).map(mapItemToFormField),
    [questionnaire]
  );

  const [fetchedItems, setFetchedItems] = useState<any[] | null>(null);

  useEffect(() => {
    // Only fetch separately when the loader returned no items for an existing questionnaire
    if (mode === "update" && questionnaire?.id && loaderItems.length === 0) {
      axiosClient
        .get(`/questions/show_all/questionnaire/${questionnaire.id}`)
        .then((res) => setFetchedItems(res.data.map(mapItemToFormField)))
        .catch((err) => {
          console.error("Error fetching questionnaire items:", err);
          setFetchedItems([]);
        });
    } else {
      setFetchedItems(loaderItems);
    }
  }, [mode, questionnaire?.id]);   // eslint-disable-line react-hooks/exhaustive-deps

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const onSubmit = async (values: QuestionnaireFormValues) => {
    values.instructor_id = auth.user.id;
    console.log("Submit:", values);
    const payload = transformQuestionnaireRequest(values);
    const endpoint = mode === "create"
      ? "/questionnaires"
      : `/questionnaires/${values.id}`;

    try {
      const response = await axiosClient[mode === "create" ? "post" : "put"](
        endpoint,
        payload
      );

      console.log("Saved Questionnaire:", response.data);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Questionnaire "${values.name}" ${
            mode === "create" ? "created" : "updated"
          } successfully!`,
        })
      );
      navigate("/questionnaires");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      let message = "Failed to save questionnaire.";
      
      if (Array.isArray(error?.response?.data)) {
        message = error.response.data.join(", ");
      } else if (error?.response?.data?.errors) {
        message = error.response.data.errors.join(", ");
      } else if (error?.response?.data?.error) {
        message = error.response.data.error;
      } else if (error?.message) {
        message = error.message;
      }
      
      dispatch(alertActions.showAlert({ variant: "danger", message }));
    }
  };

  // Don't render the form until items are ready to avoid Formik initializing with []
  if (fetchedItems === null) {
    return (
      <Container fluid className="px-md-4">
        <Row className="mt-md-2 mb-md-2">
          <Col className="text-center">
            <p>Loading questionnaire items…</p>
          </Col>
        </Row>
      </Container>
    );
  }

  const initialValues: QuestionnaireFormValues = {
    id: questionnaire?.id ?? undefined,
    name: questionnaire?.name ?? "",
    questionnaire_type: questionnaire?.questionnaire_type ?? type ?? "",
    private: questionnaire?.private ?? false,
    min_question_score: questionnaire?.min_question_score ?? 0,
    max_question_score: questionnaire?.max_question_score ?? 10,
    items: fetchedItems,
  };

  return (
    <Container fluid className="px-md-4" style={{ background: "transparent" }}>
      <Row className="mb-4">
        <Col>
          <h1 className="text-dark" style={{ fontSize: "2rem", fontWeight: "600" }}>{mode === "update"
            ? `Editing Questionnaire: ${questionnaire.name}`
            : `Creating ${type} Questionnaire`}</h1>
        </Col>
      </Row>
      <Row style={{ marginLeft: "5px" }}>
        <Col>
          <QuestionnaireForm
            initialValues={initialValues}
            onSubmit={onSubmit}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionnaireEditor;

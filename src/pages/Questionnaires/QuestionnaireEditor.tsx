import axiosClient from "../../utils/axios_client";
import { IEditor } from "../../utils/interfaces";
import {
  QuestionnaireFormValues,
  transformQuestionnaireRequest,
  normalizeQuestionnaireItemsResponse,
  coerceQuestionnaireDisplayText,
} from "./QuestionnaireUtils";
import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
import QuestionnaireForm from "./QuestionnaireForm";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "../../store/slices/alertSlice";
import type { FormikHelpers } from "formik";

function formatAxiosError(err: unknown): string {
  const e = err as { response?: { data?: unknown }; message?: string };
  const data = e.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (Array.isArray(data)) return data.map(String).join("; ");
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.error === "string") return o.error;
    if (typeof o.message === "string") return o.message;
    if (Array.isArray(o.errors)) return o.errors.map(String).join("; ");
  }
  return e.message || "Request failed.";
}

function httpStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

const QuestionnaireEditor: React.FC<IEditor> = ({ mode }) => {
  const questionnaire: any = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type");

  const hasEmbeddedItems =
    Array.isArray(questionnaire?.items) && questionnaire.items.length > 0;

  const [fetchedItems, setFetchedItems] = useState<any[]>(() =>
    mode === "update" && hasEmbeddedItems
      ? normalizeQuestionnaireItemsResponse(questionnaire.items)
      : []
  );
  const [itemsLoading, setItemsLoading] = useState(
    () => mode === "update" && !hasEmbeddedItems
  );
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [itemsInfo, setItemsInfo] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "update" || !questionnaire?.id) {
      setItemsLoading(false);
      setItemsError(null);
      setItemsInfo(null);
      return;
    }
    if (Array.isArray(questionnaire.items) && questionnaire.items.length > 0) {
      setFetchedItems(normalizeQuestionnaireItemsResponse(questionnaire.items));
      setItemsLoading(false);
      setItemsError(null);
      setItemsInfo(null);
      return;
    }

    let cancelled = false;
    setItemsLoading(true);
    setItemsError(null);
    setItemsInfo(null);
    axiosClient
      .get(`/questionnaires/${questionnaire.id}/items`)
      .then((res) => {
        if (cancelled) return;
        setFetchedItems(normalizeQuestionnaireItemsResponse(res.data));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching questionnaire items:", err);
        if (httpStatus(err) === 404) {
          setItemsError(null);
          setItemsInfo(
            "This API does not implement GET /questionnaires/:id/items (404). The editor uses questions embedded in GET /questionnaires/:id when available. To load rubric lines separately, add that route on the server or include an `items` (or `questions`) array on the questionnaire JSON."
          );
        } else {
          setItemsError(formatAxiosError(err));
          setItemsInfo(null);
        }
        setFetchedItems([]);
      })
      .finally(() => {
        if (!cancelled) setItemsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, questionnaire?.id, questionnaire?.items?.length]);

  const dispatch = useDispatch();
  const auth = useSelector(
      (state: RootState) => state.authentication,
      (prev, next) => prev.isAuthenticated === next.isAuthenticated
    );

  const onSubmit = async (
    values: QuestionnaireFormValues,
    { setSubmitting }: FormikHelpers<QuestionnaireFormValues>
  ) => {
    const uid = auth?.user?.id;
    if (uid == null) {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: "You must be signed in to save a questionnaire.",
        })
      );
      setSubmitting(false);
      return;
    }
    values.instructor_id = uid;
    const payload = transformQuestionnaireRequest(values);
    const endpoint = mode === "create" ? "/questionnaires" : `/questionnaires/${values.id}`;

    try {
      await axiosClient[mode === "create" ? "post" : "put"](endpoint, payload);
      dispatch(
        alertActions.showAlert({ variant: "success", message: "Questionnaire saved successfully." })
      );
      navigate("/questionnaires");
    } catch (error) {
      console.error("Error submitting form:", error);
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: formatAxiosError(error),
        })
      );
    } finally {
      setSubmitting(false);
    }
  };



  const itemRows =
    fetchedItems.length > 0
      ? fetchedItems
      : Array.isArray(questionnaire?.items) && questionnaire.items.length > 0
        ? questionnaire.items
        : [];

  const initialValues: QuestionnaireFormValues = {
    id: questionnaire?.id ?? undefined,
    name: questionnaire?.name ?? "",
    questionnaire_type: questionnaire?.questionnaire_type ?? type ?? "",
    private: questionnaire?.private ?? false,
    min_question_score: questionnaire?.min_question_score ?? 0,
    max_question_score: questionnaire?.max_question_score ?? 10,
    items: itemRows.map((item: any) => ({
      id: item.id,
      // Guard against API shapes that return nested objects for label fields (e.g. `{ txt: "..." }`).
      txt: coerceQuestionnaireDisplayText(item.txt),
      question_type: item.question_type,
      weight: item.weight,
      alternatives: coerceQuestionnaireDisplayText(item.alternatives),
      min_label: coerceQuestionnaireDisplayText(item.min_label) as any,
      max_label: coerceQuestionnaireDisplayText(item.max_label) as any,
      textarea_width: item.textarea_width,
      textarea_height: item.textarea_height,
      textbox_width: item.textbox_width,
      col_names: coerceQuestionnaireDisplayText(item.col_names) as any,
      row_names: coerceQuestionnaireDisplayText(item.row_names) as any,
      seq: item.seq,
      break_before: item.break_before,
      _destroy: item._destroy || false,
    })),
  };

  if (mode === "update" && itemsLoading) {
    return (
      <Container fluid className="px-md-4 py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3 text-muted">Loading questionnaire items…</p>
      </Container>
    );
  }

  return (
    <Container fluid className="px-md-4">
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>
            {mode === "update"
              ? `Update Questionnaire: ${questionnaire.name}`
              : `Create ${type} Questionnaire`}
          </h1>
        </Col>
        <hr />
      </Row>
      {itemsInfo && (
        <Row>
          <Col>
            <Alert variant="info" dismissible onClose={() => setItemsInfo(null)}>
              {itemsInfo}
            </Alert>
          </Col>
        </Row>
      )}
      {itemsError && (
        <Row>
          <Col>
            <Alert variant="danger">
              <strong>Could not load rubric items.</strong> {itemsError} If items were saved, check that the API
              returns them as an array or as <code>{"{ items: [...] }"}</code> from{" "}
              <code>GET /questionnaires/:id/items</code>.
            </Alert>
          </Col>
        </Row>
      )}
      <Row style={{ marginLeft: "5px" }}>
        <Col>
          <QuestionnaireForm initialValues={initialValues} onSubmit={onSubmit} />
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionnaireEditor;

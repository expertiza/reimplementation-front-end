import axios from "axios";
import axiosClient from "../../utils/axios_client";
import { IEditor } from "../../utils/interfaces";
import { IItem, mapItemToFormField, QuestionnaireFormValues, transformQuestionnaireRequest } from "./QuestionnaireUtils";
import React, { useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import QuestionnaireForm from "./QuestionnaireForm";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";

const QuestionnaireEditor: React.FC<IEditor> = ({ mode }) => {
  const questionnaire = useLoaderData() as QuestionnaireFormValues | undefined;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const type = searchParams.get("type");

  // Use items already returned by the loader; fall back to a separate fetch
  // only if the loader didn't include them (older backend behavior).
  const loaderItems: IItem[] = useMemo(
    () => (questionnaire?.items ?? []).map(mapItemToFormField),
    [questionnaire]
  );

  const [fetchedItems, setFetchedItems] = useState<IItem[] | null>(null);

  useEffect(() => {
    // Only fetch separately when the loader returned no items for an existing questionnaire
    if (mode === "update" && questionnaire?.id && loaderItems.length === 0) {
      axiosClient
        .get(`/items/show_all/questionnaire/${questionnaire.id}`)
        .then((res) => setFetchedItems(res.data.map(mapItemToFormField)))
        .catch((err) => {
          console.error("Error fetching questionnaire items:", err);
          setFetchedItems([]);
        });
    } else {
      setFetchedItems(loaderItems);
    }
  }, [mode, questionnaire?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const onSubmit = async (values: QuestionnaireFormValues) => {
    values.instructor_id = auth.user.id;
    console.log("Submit:", values);
    const payload = transformQuestionnaireRequest(values);
    const endpoint = mode === "create" ? "/questionnaires" : `/questionnaires/${values.id}`;

    try {
      const response = await axiosClient[mode === "create" ? "post" : "put"](endpoint, payload);

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
    } catch (caughtError: unknown) {
      const error = axios.isAxiosError<string[] | { errors?: string[]; error?: string }>(caughtError)
        ? caughtError
        : undefined;
      console.error("Error submitting form:", caughtError);
      let message = "Failed to save questionnaire.";

      if (Array.isArray(error?.response?.data)) {
        message = error.response.data.join(", ");
      } else if (error?.response?.data && typeof error.response.data === "object" && "errors" in error.response.data && error.response.data.errors) {
        message = error.response.data.errors.join(", ");
      } else if (error?.response?.data && typeof error.response.data === "object" && "error" in error.response.data && error.response.data.error) {
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
    min_item_score: questionnaire?.min_item_score ?? 0,
    max_item_score: questionnaire?.max_item_score ?? 10,
    items: fetchedItems,
  };

  return (
    <Container fluid className="px-md-4" style={{ background: "transparent" }}>
      <Row className="mb-4">
        <Col>
          <h1 className="text-dark" style={{ fontSize: "2rem", fontWeight: "600" }}>
            {mode === "update"
              ? `Editing Questionnaire: ${questionnaire?.name ?? ""}`
              : `Creating ${type} Questionnaire`}
          </h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <QuestionnaireForm initialValues={initialValues} onSubmit={onSubmit} />
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionnaireEditor;

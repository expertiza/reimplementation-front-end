import * as Yup from "yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { Button, FormSelect, Modal } from "react-bootstrap";
import { Form, Formik, FormikHelpers } from "formik";
import { IAssignmentFormValues, transformAssignmentRequest } from "./AssignmentUtil";
import { IEditor } from "../../utils/interfaces";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import FormInput from "components/Form/FormInput";
import { HttpMethod } from "utils/httpMethods";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";
import FormCheckbox from "components/Form/FormCheckBox";
import { Tabs, Tab } from 'react-bootstrap';
import '../../custom.scss';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from "react-i18next"; // Importing useTranslation hook

const initialValues: IAssignmentFormValues = {
  name: "",
  directory_path: "",
  // dir: "",
  spec_location: "",
  private: false,
  show_template_review: false,
  require_quiz: false,
  has_badge: false,
  staggered_deadline: false,
  is_calibrated: false,
  // Add other assignment-specific initial values
};

const validationSchema = Yup.object({
  name: Yup.string().required("Required")
  // Add other assignment-specific validation rules
});

const AssignmentEditor: React.FC<IEditor> = ({ mode }) => {
  const { t } = useTranslation(); // Initialize useTranslation hook
  const { data: assignmentResponse, error: assignmentError, sendRequest } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const assignmentData: any = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Close the modal if the assignment is updated successfully and navigate to the assignments page
  useEffect(() => {
    if (
      assignmentResponse &&
      assignmentResponse.status >= 200 &&
      assignmentResponse.status < 300
    ) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: t('assignments.success_message', { assignmentName: assignmentData.name, mode }),
        })
      );
      navigate(location.state?.from ? location.state.from : "/assignments");
    }
  }, [dispatch, mode, navigate, assignmentData, assignmentResponse, location.state?.from, t]);

  // Show the error message if the assignment is not updated successfully
  useEffect(() => {
    assignmentError && dispatch(alertActions.showAlert({ variant: "danger", message: assignmentError }));
  }, [assignmentError, dispatch]);

  const onSubmit = (
    values: IAssignmentFormValues,
    submitProps: FormikHelpers<IAssignmentFormValues>
  ) => {
    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/assignments";
    if (mode === "update") {
      url = `/assignments/${values.id}`;
      method = HttpMethod.PATCH;
    }
    // to be used to display message when assignment is created
    assignmentData.name = values.name;
    console.log(values);
    sendRequest({
      url: url,
      method: method,
      data: values,
      transformRequest: transformAssignmentRequest,
    });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/assignments");

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? t('assignments.update_title', { assignmentName: assignmentData.name }) : t('assignments.create_title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {assignmentError && <p className="text-danger">{assignmentError}</p>}
        <Tabs defaultActiveKey="general" id="assignment-tabs">
          <Tab eventKey="general" title={t('assignments.tabs.general')}>
            <Formik
              initialValues={mode === "update" ? assignmentData : initialValues}
              onSubmit={onSubmit}
              validationSchema={validationSchema}
              validateOnChange={false}
              enableReinitialize={true}
            >
              {(formik) => {
                return (
                  <Form>
                    <FormInput controlId="assignment-name" label={t('assignments.fields.name')} name="name" />
                    <FormInput controlId="assignment-directory_path" label={t('assignments.fields.directory_path')} name="directory_path" />
                    <FormInput controlId="assignment-spec_location" label={t('assignments.fields.spec_location')} name="spec_location" />
                    <FormInput controlId="assignment-submitter_count" label={t('assignments.fields.submitter_count')} name="submitter_count" type="number" />
                    <FormInput controlId="assignment-num_reviews" label={t('assignments.fields.num_reviews')} name="num_reviews" type="number" />
                    <FormInput controlId="assignment-num_review_of_reviews" label={t('assignments.fields.num_review_of_reviews')} name="num_review_of_reviews" type="number" />
                    <FormInput controlId="assignment-num_review_of_reviewers" label={t('assignments.fields.num_review_of_reviewers')} name="num_review_of_reviewers" type="number" />
                    <FormInput controlId="assignment-num_reviewers" label={t('assignments.fields.num_reviewers')} name="num_reviewers" type="number" />
                    <FormInput controlId="assignment-max_team_size" label={t('assignments.fields.max_team_size')} name="max_team_size" type="number" />
                    <FormInput controlId="assignment-days_between_submissions" label={t('assignments.fields.days_between_submissions')} name="days_between_submissions" type="number" />
                    <FormInput controlId="assignment-review_assignment_strategy" label={t('assignments.fields.review_assignment_strategy')} name="review_assignment_strategy" />
                    <FormInput controlId="assignment-max_reviews_per_submission" label={t('assignments.fields.max_reviews_per_submission')} name="max_reviews_per_submission" type="number" />
                    <FormInput controlId="assignment-review_topic_threshold" label={t('assignments.fields.review_topic_threshold')} name="review_topic_threshold" type="number" />
                    <FormInput controlId="assignment-rounds_of_reviews" label={t('assignments.fields.rounds_of_reviews')} name="rounds_of_reviews" type="number" />
                    <FormInput controlId="assignment-num_quiz_questions" label={t('assignments.fields.num_quiz_questions')} name="num_quiz_questions" type="number" />
                    <FormInput controlId="assignment-late_policy_id" label={t('assignments.fields.late_policy_id')} name="late_policy_id" type="number" />
                    <FormInput controlId="assignment-max_bids" label={t('assignments.fields.max_bids')} name="max_bids" type="number" />
                    <FormCheckbox controlId="assignment-private" label={t('assignments.fields.private')} name="private" />
                    <FormCheckbox controlId="assignment-show_teammate_review" label={t('assignments.fields.show_teammate_review')} name="show_teammate_review" />
                    <FormCheckbox controlId="assignment-require_quiz" label={t('assignments.fields.require_quiz')} name="require_quiz" />
                    <FormCheckbox controlId="assignment-has_badge" label={t('assignments.fields.has_badge')} name="has_badge" />
                    <FormCheckbox controlId="assignment-staggered_deadline" label={t('assignments.fields.staggered_deadline')} name="staggered_deadline" />
                    <FormCheckbox controlId="assignment-is_calibrated" label={t('assignments.fields.is_calibrated')} name="is_calibrated" />
                    <FormCheckbox controlId="assignment-reviews_visible_to_all" label={t('assignments.fields.reviews_visible_to_all')} name="reviews_visible_to_all" />
                    <FormCheckbox controlId="assignment-allow_suggestions" label={t('assignments.fields.allow_suggestions')} name="allow_suggestions" />
                    <FormCheckbox controlId="assignment-copy_flag" label={t('assignments.fields.copy_flag')} name="copy_flag" />
                    <FormCheckbox controlId="assignment-microtask" label={t('assignments.fields.microtask')} name="microtask" />
                    <FormCheckbox controlId="assignment-is_coding_assignment" label={t('assignments.fields.is_coding_assignment')} name="is_coding_assignment" />
                    <FormCheckbox controlId="assignment-is_intelligent" label={t('assignments.fields.is_intelligent')} name="is_intelligent" />
                    <FormCheckbox controlId="assignment-calculate_penalty" label={t('assignments.fields.calculate_penalty')} name="calculate_penalty" />
                    <FormCheckbox controlId="assignment-is_penalty_calculated" label={t('assignments.fields.is_penalty_calculated')} name="is_penalty_calculated" />
                    <FormCheckbox controlId="assignment-availability_flag" label={t('assignments.fields.availability_flag')} name="availability_flag" />
                    <FormCheckbox controlId="assignment-use_bookmark" label={t('assignments.fields.use_bookmark')} name="use_bookmark" />
                    <FormCheckbox controlId="assignment-can_review_same_topic" label={t('assignments.fields.can_review_same_topic')} name="can_review_same_topic" />
                    <FormCheckbox controlId="assignment-can_choose_topic_to_review" label={t('assignments.fields.can_choose_topic_to_review')} name="can_choose_topic_to_review" />
                    <Modal.Footer>
                      <Button variant="outline-secondary" onClick={handleClose}>
                        {t('assignments.close')}
                      </Button>

                      <Button
                        variant="outline-success"
                        type="submit"
                        disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                      >
                        {mode === "update" ? t('assignments.update') : t('assignments.create')}
                      </Button>
                    </Modal.Footer>
                  </Form>
                );
              }}
            </Formik>
          </Tab>
          <Tab eventKey="etc" title={t('assignments.tabs.etc')}>
            <div className="assignment-actions d-flex flex-wrap justify-content-start">
              <div className="custom-tab-button" onClick={() => navigate(`participants`)}>
                <FontAwesomeIcon icon={faUser} className="icon" />
                <span>{t('assignments.actions.add_participant')}</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/createteams`)}>
                <FontAwesomeIcon icon={faUsers} className="icon" />
                <span>{t('assignments.actions.create_teams')}</span>
              </div>

              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/assignreviewer`)}>
                <FontAwesomeIcon icon={faUserCheck} className="icon" />
                <span>{t('assignments.actions.assign_reviewer')}</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewsubmissions`)}>
                <FontAwesomeIcon icon={faClipboardList} className="icon" />
                <span>{t('assignments.actions.view_submissions')}</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewscores`)}>
                <FontAwesomeIcon icon={faChartBar} className="icon" />
                <span>{t('assignments.actions.view_scores')}</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewreports`)}>
                <FontAwesomeIcon icon={faFileAlt} className="icon" />
                <span>{t('assignments.actions.view_reports')}</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewdelayedjobs`)}>
                <FontAwesomeIcon icon={faClock} className="icon" />
                <span>{t('assignments.actions.view_delayed_jobs')}</span>
              </div>
            </div>

          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AssignmentEditor;
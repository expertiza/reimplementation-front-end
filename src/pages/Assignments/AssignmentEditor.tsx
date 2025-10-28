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
import FormInput from "../../components/Form/FormInput";
import { HttpMethod } from "../../utils/httpMethods";
import { RootState } from "../../store/store";
import { alertActions } from "../../store/slices/alertSlice";
import useAPI from "../../hooks/useAPI";
import FormCheckbox from "../../components/Form/FormCheckBox";
import { Tabs, Tab } from 'react-bootstrap';
import '../../custom.scss';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';

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
          message: `Assignment ${assignmentData.name} ${mode}d successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : "/assignments");
    }
  }, [dispatch, mode, navigate, assignmentData, assignmentResponse, location.state?.from]);

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
        <Modal.Title>{mode === "update" ? `Update Assignment - ${assignmentData.name}` : "Create Assignment"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {assignmentError && <p className="text-danger">{assignmentError}</p>}
        <Tabs defaultActiveKey="general" id="assignment-tabs">
          <Tab eventKey="general" title="General">
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
                    <FormInput controlId="assignment-name" label="Assignment Name" name="name" />
                    <FormInput controlId="assignment-directory_path" label="Submission Directory" name="directory_path" />
                    <FormInput controlId="assignment-spec_location" label="Description URL" name="spec_location" />
                    <FormInput controlId="assignment-submitter_count" label="Submitter Count" name="submitter_count" type="number" />
                    <FormInput controlId="assignment-num_reviews" label="Number of Reviews" name="num_reviews" type="number" />
                    <FormInput controlId="assignment-num_review_of_reviews" label="Number of Review of Reviews" name="num_review_of_reviews" type="number" />
                    <FormInput controlId="assignment-num_review_of_reviewers" label="Number of Review of Reviewers" name="num_review_of_reviewers" type="number" />
                    <FormInput controlId="assignment-num_reviewers" label="Number of Reviewers" name="num_reviewers" type="number" />
                    <FormInput controlId="assignment-max_team_size" label="Max Team Size" name="max_team_size" type="number" />
                    <FormInput controlId="assignment-days_between_submissions" label="Days Between Submissions" name="days_between_submissions" type="number" />
                    <FormInput controlId="assignment-review_assignment_strategy" label="Review Assignment Strategy" name="review_assignment_strategy" />
                    <FormInput controlId="assignment-max_reviews_per_submission" label="Max Reviews Per Submission" name="max_reviews_per_submission" type="number" />
                    <FormInput controlId="assignment-review_topic_threshold" label="Review Topic Threshold" name="review_topic_threshold" type="number" />
                    <FormInput controlId="assignment-rounds_of_reviews" label="Rounds of Reviews" name="rounds_of_reviews" type="number" />
                    <FormInput controlId="assignment-num_quiz_questions" label="Number of Quiz Questions" name="num_quiz_questions" type="number" />
                    <FormInput controlId="assignment-late_policy_id" label="Late Policy ID" name="late_policy_id" type="number" />
                    <FormInput controlId="assignment-max_bids" label="Max Bids" name="max_bids" type="number" />
                    <FormCheckbox controlId="assignment-private" label="Private Assignment" name="private" />
                    <FormCheckbox controlId="assignment-show_teammate_review" label="Show Teammate Reviews?" name="show_teammate_review" />
                    <FormCheckbox controlId="assignment-require_quiz" label="Has quiz?" name="require_quiz" />
                    <FormCheckbox controlId="assignment-has_badge" label="Has badge?" name="has_badge" />
                    <FormCheckbox controlId="assignment-staggered_deadline" label="Staggered deadline assignment?" name="staggered_deadline" />
                    <FormCheckbox controlId="assignment-is_calibrated" label="Calibration for training?" name="is_calibrated" />
                    <FormCheckbox controlId="assignment-reviews_visible_to_all" label="Reviews Visible to All" name="reviews_visible_to_all" />
                    <FormCheckbox controlId="assignment-allow_suggestions" label="Allow Suggestions" name="allow_suggestions" />
                    <FormCheckbox controlId="assignment-copy_flag" label="Copy Flag" name="copy_flag" />
                    <FormCheckbox controlId="assignment-microtask" label="Microtask" name="microtask" />
                    <FormCheckbox controlId="assignment-is_coding_assignment" label="Is Coding Assignment" name="is_coding_assignment" />
                    <FormCheckbox controlId="assignment-is_intelligent" label="Is Intelligent" name="is_intelligent" />
                    <FormCheckbox controlId="assignment-calculate_penalty" label="Calculate Penalty" name="calculate_penalty" />
                    <FormCheckbox controlId="assignment-is_penalty_calculated" label="Is Penalty Calculated" name="is_penalty_calculated" />
                    <FormCheckbox controlId="assignment-availability_flag" label="Availability Flag" name="availability_flag" />
                    <FormCheckbox controlId="assignment-use_bookmark" label="Use Bookmark" name="use_bookmark" />
                    <FormCheckbox controlId="assignment-can_review_same_topic" label="Can Review Same Topic" name="can_review_same_topic" />
                    <FormCheckbox controlId="assignment-can_choose_topic_to_review" label="Can Choose Topic to Review" name="can_choose_topic_to_review" />
                    <Modal.Footer>
                      <Button variant="outline-secondary" onClick={handleClose}>
                        Close
                      </Button>

                      <Button
                        variant="outline-success"
                        type="submit"
                        disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                      >
                        {mode === "update" ? "Update Assignment" : "Create Assignment"}
                      </Button>
                    </Modal.Footer>
                  </Form>
                );
              }}
            </Formik>
          </Tab>
          <Tab eventKey="etc" title="Etc">
            <div className="assignment-actions d-flex flex-wrap justify-content-start">
              <div className="custom-tab-button" onClick={() => navigate(`participants`)}>
                <FontAwesomeIcon icon={faUser} className="icon" />
                <span>Add Participant</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/createteams`)}>
                <FontAwesomeIcon icon={faUsers} className="icon" />
                <span>Create Teams</span>
              </div>

              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/assignreviewer`)}>
                <FontAwesomeIcon icon={faUserCheck} className="icon" />
                <span>Assign Reviewer</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewsubmissions`)}>
                <FontAwesomeIcon icon={faClipboardList} className="icon" />
                <span>View Submissions</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewscores`)}>
                <FontAwesomeIcon icon={faChartBar} className="icon" />
                <span>View Scores</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewreports`)}>
                <FontAwesomeIcon icon={faFileAlt} className="icon" />
                <span>View Reports</span>
              </div>
              <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewdelayedjobs`)}>
                <FontAwesomeIcon icon={faClock} className="icon" />
                <span>View Delayed Jobs</span>
              </div>
            </div>

          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AssignmentEditor;
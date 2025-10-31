import { Col, Row } from "react-bootstrap";

const GeneralTab = () => {
  return (
    <Row className="mt-4">
      <Col>
        {/* This form is a direct conversion of your HTML.
          It assumes a <Formik> and <Form> component are wrapped
          around this GeneralTab component by its parent.
        */}
        
        <div className="row">
          {/* Column 1: Text & Number Inputs 
          This maps to your <FormInput> components
          */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="assignment-name" className="form-label">Assignment Name</label>
              <input type="text" id="assignment-name" name="name" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-directory_path" className="form-label">Submission Directory</label>
              <input type="text" id="assignment-directory_path" name="directory_path" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-spec_location" className="form-label">Description URL</label>
              <input type="text" id="assignment-spec_location" name="spec_location" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-submitter_count" className="form-label">Submitter Count</label>
              <input type="number" id="assignment-submitter_count" name="submitter_count" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-num_reviews" className="form-label">Number of Reviews</label>
              <input type="number" id="assignment-num_reviews" name="num_reviews" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-num_review_of_reviews" className="form-label">Number of Review of Reviews</label>
              <input type="number" id="assignment-num_review_of_reviews" name="num_review_of_reviews" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-num_review_of_reviewers" className="form-label">Number of Review of Reviewers</label>
              <input type="number" id="assignment-num_review_of_reviewers" name="num_review_of_reviewers" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-num_reviewers" className="form-label">Number of Reviewers</label>
              <input type="number" id="assignment-num_reviewers" name="num_reviewers" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-max_team_size" className="form-label">Max Team Size</label>
              <input type="number" id="assignment-max_team_size" name="max_team_size" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-days_between_submissions" className="form-label">Days Between Submissions</label>
              <input type="number" id="assignment-days_between_submissions" name="days_between_submissions" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-review_assignment_strategy" className="form-label">Review Assignment Strategy</label>
              <input type="text" id="assignment-review_assignment_strategy" name="review_assignment_strategy" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-max_reviews_per_submission" className="form-label">Max Reviews Per Submission</label>
              <input type="number" id="assignment-max_reviews_per_submission" name="max_reviews_per_submission" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-review_topic_threshold" className="form-label">Review Topic Threshold</label>
              <input type="number" id="assignment-review_topic_threshold" name="review_topic_threshold" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-rounds_of_reviews" className="form-label">Rounds of Reviews</label>
              <input type="number" id="assignment-rounds_of_reviews" name="rounds_of_reviews" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-num_quiz_questions" className="form-label">Number of Quiz Questions</label>
              <input type="number" id="assignment-num_quiz_questions" name="num_quiz_questions" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-late_policy_id" className="form-label">Late Policy ID</label>
              <input type="number" id="assignment-late_policy_id" name="late_policy_id" className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="assignment-max_bids" className="form-label">Max Bids</label>
              <input type="number" id="assignment-max_bids" name="max_bids" className="form-control" />
            </div>
          </div>

          {/* Column 2: Checkboxes
          This maps to your <FormCheckbox> components
          */}
          <div className="col-md-6">
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-private" name="private" className="form-check-input" />
              <label htmlFor="assignment-private" className="form-check-label">Private Assignment</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-show_teammate_review" name="show_teammate_review" className="form-check-input" />
              <label htmlFor="assignment-show_teammate_review" className="form-check-label">Show Teammate Reviews?</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-require_quiz" name="require_quiz" className="form-check-input" />
              <label htmlFor="assignment-require_quiz" className="form-check-label">Has quiz?</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-has_badge" name="has_badge" className="form-check-input" />
              <label htmlFor="assignment-has_badge" className="form-check-label">Has badge?</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-staggered_deadline" name="staggered_deadline" className="form-check-input" />
              <label htmlFor="assignment-staggered_deadline" className="form-check-label">Staggered deadline assignment?</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-is_calibrated" name="is_calibrated" className="form-check-input" />
              <label htmlFor="assignment-is_calibrated" className="form-check-label">Calibration for training?</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-reviews_visible_to_all" name="reviews_visible_to_all" className="form-check-input" />
              <label htmlFor="assignment-reviews_visible_to_all" className="form-check-label">Reviews Visible to All</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-allow_suggestions" name="allow_suggestions" className="form-check-input" />
              <label htmlFor="assignment-allow_suggestions" className="form-check-label">Allow Suggestions</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-copy_flag" name="copy_flag" className="form-check-input" />
              <label htmlFor="assignment-copy_flag" className="form-check-label">Copy Flag</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-microtask" name="microtask" className="form-check-input" />
              <label htmlFor="assignment-microtask" className="form-check-label">Microtask</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-is_coding_assignment" name="is_coding_assignment" className="form-check-input" />
              <label htmlFor="assignment-is_coding_assignment" className="form-check-label">Is Coding Assignment</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-is_intelligent" name="is_intelligent" className="form-check-input" />
              <label htmlFor="assignment-is_intelligent" className="form-check-label">Is Intelligent</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-calculate_penalty" name="calculate_penalty" className="form-check-input" />
              <label htmlFor="assignment-calculate_penalty" className="form-check-label">Calculate Penalty</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-is_penalty_calculated" name="is_penalty_calculated" className="form-check-input" />
              <label htmlFor="assignment-is_penalty_calculated" className="form-check-label">Is Penalty Calculated</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-availability_flag" name="availability_flag" className="form-check-input" />
              <label htmlFor="assignment-availability_flag" className="form-check-label">Availability Flag</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-use_bookmark" name="use_bookmark" className="form-check-input" />
              <label htmlFor="assignment-use_bookmark" className="form-check-label">Use Bookmark</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-can_review_same_topic" name="can_review_same_topic" className="form-check-input" />
              <label htmlFor="assignment-can_review_same_topic" className="form-check-label">Can Review Same Topic</label>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" id="assignment-can_choose_topic_to_review" name="can_choose_topic_to_review" className="form-check-input" />
              <label htmlFor="assignment-can_choose_topic_to_review" className="form-check-label">Can Choose Topic to Review</label>
            </div>
          </div>
        </div>

        {/* Footer / Buttons
        This maps to your <Modal.Footer>
        */}
        <div className="mt-4 pt-3 border-top d-flex justify-content-end">
          <button type="button" className="btn btn-outline-secondary me-2">
            Close
          </button>
          <button type="submit" className="btn btn-outline-success">
            Create Assignment
          </button>
        </div>

      </Col>
    </Row>
  );
};

export default GeneralTab;

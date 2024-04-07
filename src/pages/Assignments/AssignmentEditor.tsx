import * as Yup from "yup";

import { Button, Row, Col, Container, Tab, Tabs, Table } from "react-bootstrap";
import { FormGroup, FormLabel, FormControl, FormCheck } from "react-bootstrap";
import { Form, Formik, FormikHelpers } from "formik";
import { IAssignmentFormValues, transformAssignmentRequest } from "./AssignmentUtil";
import { IEditor } from "../../utils/interfaces";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLoaderData, useLocation, useNavigate } from "react-router-dom";

import FormInput from "components/Form/FormInput";
import { HttpMethod } from "utils/httpMethods";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";
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
  name: Yup.string().required("Required"),
  // Add other assignment-specific validation rules
});

const AssignmentEditor: React.FC<IEditor> = ({ mode }) => {
  const [activeTab, setActiveTab] = useState("general"); // Define activeTab state
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isTeamTableVisible, setIsTeamTableVisible] = useState(true);

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
    if (assignmentResponse && assignmentResponse.status >= 200 && assignmentResponse.status < 300) {
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
    assignmentError &&
      dispatch(alertActions.showAlert({ variant: "danger", message: assignmentError }));
  }, [assignmentError, dispatch]);

  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  const toggleTeamTableVisibility = () => {
    setIsTeamTableVisible(!isTeamTableVisible);
  };

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

  const [rows, setRows] = useState([
    { useDropdown: "", tagPrompts: [{ label: "", selectedOption: "" }] },
  ]);

  const handleAddTagPrompt = (index: any) => {
    const newRows = [...rows];
    newRows[index].tagPrompts.push({ label: "", selectedOption: "" });
    setRows(newRows);
  };

  const handleRemoveTagPrompt = (rowIndex: any, tagIndex: any) => {
    const newRows = [...rows];
    newRows[rowIndex].tagPrompts.splice(tagIndex, 1);
    setRows(newRows);
  };

  const handleDropdownChange = (index: any, tagIndex: any, selectedOption: any) => {
    const newRows = [...rows];
    newRows[index].tagPrompts[tagIndex].selectedOption = selectedOption;
    setRows(newRows);
  };

  const handleUseDropdownChange = (index: any, selectedOption: any) => {
    const newRows = [...rows];
    newRows[index].useDropdown = selectedOption;
    setRows(newRows);
  };

  const handleTabSelect = (tab: any) => {
    setActiveTab(tab);
  };

  const getTabTitleStyle = (tab: any) => {
    return tab === activeTab ? { color: "#FFD700" } : { color: "red" };
  };

  return (
    <div>
      <Container>
        <h1>{mode === "update" ? "Update Assignment" : "Create Assignment"}</h1>

        {assignmentError && <p className="text-danger">{assignmentError}</p>}
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
                <Tabs
                  defaultActiveKey="general"
                  id="assignment-editor-tabs"
                  className="mb-3"
                  activeKey={activeTab}
                  onSelect={(key: string | null) => setActiveTab(key ?? "inputs")} // Handle tab selection
                >
                  <Tab
                    eventKey="general"
                    title={<span style={getTabTitleStyle("general")}>General</span>}
                  >
                    <FormGroup>
                      <FormInput controlId="assignment-name" label="Assignment Name" name="name" />
                      <FormGroup controlId="course-name">
                        <FormLabel>Course</FormLabel>
                        <FormControl as="select" name="course">
                          <option value="course1">Course 1</option>
                          <option value="course2">Course 2</option>
                          <option value="course3">Course 3</option>
                        </FormControl>
                      </FormGroup>
                      <FormInput
                        controlId="assignment-directory_path"
                        label="Submission Directory"
                        name="directory_path"
                      />
                      <FormInput
                        controlId="assignment-spec_location"
                        label="Description URL"
                        name="spec_location"
                      />
                      <FormCheck
                        id="private-assignment"
                        type="checkbox"
                        name="private-assignment"
                        label="Private Assignment"
                      />
                      <FormCheck
                        id="has-teams"
                        type="checkbox"
                        name="has-teams"
                        label="Has Teams?"
                      />
                      <FormGroup
                        controlId="max-team-members"
                        style={{ display: "flex", flexDirection: "row" }}
                      >
                        <FormLabel style={{ marginRight: "10px" }}>
                          Maximum number of members per team
                        </FormLabel>
                        <FormControl type="number" name="digitInput" style={{ width: "50px" }} />
                      </FormGroup>
                      <FormCheck
                        id="show-teammate-reviews"
                        type="checkbox"
                        name="show-teammate-reviews"
                        label="Show teammate reviews"
                      />
                      <FormCheck
                        id="pair-programming"
                        type="checkbox"
                        name="pair-programming"
                        label="Pair Programming?"
                      />
                      <FormCheck
                        id="auto-assign-mentors"
                        type="checkbox"
                        name="auto-assign-mentors"
                        label="Auto-assign mentors when team hits > 50% capacity?"
                      />
                      <FormCheck id="has-quiz" type="checkbox" name="has-quiz" label="Has quiz?" />
                      <FormCheck
                        id="has-badge"
                        type="checkbox"
                        name="has-badge"
                        label="Has badge?"
                      />
                      <FormCheck
                        id="review-paper-for-conference"
                        type="checkbox"
                        name="review-paper-for-conference"
                        label="Will this assignment be used to review papers for conference?"
                      />
                      <FormCheck
                        id="has-topics"
                        type="checkbox"
                        name="has-topics"
                        label="Has topics"
                      />
                      <FormCheck
                        id="staggered-deadline-assignment"
                        type="checkbox"
                        name="staggered-deadline-assignment"
                        label="Staggered-deadline assignment"
                      />
                      <FormCheck
                        id="micro-task-assignment"
                        type="checkbox"
                        name="micro-task-assignment"
                        label="Micro-task Assignment"
                      />
                      <FormCheck
                        id="review-visible"
                        type="checkbox"
                        name="review-visible"
                        label="Review visible to all the reviewers"
                      />
                      <FormCheck
                        id="calibration-training"
                        type="checkbox"
                        name="calibration-training"
                        label="Calibration for training?"
                      />
                      <FormGroup
                        controlId="max-team-members"
                        style={{ display: "flex", flexDirection: "row" }}
                      >
                        <FormLabel style={{ marginRight: "10px" }}>Reputation Algorithm?</FormLabel>
                        <FormControl
                          as="select"
                          name="reputation-algorithm"
                          style={{ width: "110px" }}
                        >
                          <option value="default">Not Selected</option>
                          <option value="lauw">Lauw</option>
                          <option value="course2">Course 2</option>
                        </FormControl>
                      </FormGroup>
                      <FormCheck
                        id="use-simicheck"
                        type="checkbox"
                        name="use-simicheck"
                        label="Use simicheck for plagiarism detection"
                      />
                      <FormCheck
                        id="allow-tag-prompts"
                        type="checkbox"
                        name="allow-tag-prompts"
                        label="Allow tag prompt so author can tag feedback comments"
                      />
                      <FormCheck
                        id="available-to-students"
                        type="checkbox"
                        name="available-to-students"
                        label="Available to students?"
                      />
                    </FormGroup>
                  </Tab>
                  <Tab
                    eventKey="topics"
                    title={<span style={getTabTitleStyle("topics")}>Topics</span>}
                  >
                    <FormGroup>
                      <FormCheck
                        id="topic-suggestion"
                        type="checkbox"
                        name="topic-suggestion"
                        label="Allow topic suggestions from students?"
                      />
                      <FormCheck
                        id="enable-bidding"
                        type="checkbox"
                        name="enable-bidding"
                        label="Enable bidding for topics?"
                      />
                      <FormCheck
                        id="enable-author-review-others"
                        type="checkbox"
                        name="enable-author-review-others"
                        label="Enable authors to review others working on same topic?"
                      />
                      <FormCheck
                        id="allow-reviewer-to-topic"
                        type="checkbox"
                        name="allow-reviewer-to-topic"
                        label="Allow reviewer to choose which topic to review"
                      />
                      <FormCheck
                        id="create-boomarks"
                        type="checkbox"
                        name="create-boomarks"
                        label="Allow participants to create bookmarks"
                      />
                      <FormCheck
                        id="bidding-for-reviewers"
                        type="checkbox"
                        name="bidding-for-reviewers"
                        label="Allow binding for reviewers?"
                      />
                      <Button onClick={toggleTeamTableVisibility}>
                        {isTeamTableVisible ? "Hide Table" : "Show Table"}
                      </Button>
                      <div style={{ maxWidth: "800px" }}>
                        {isTeamTableVisible && (
                          <Table striped="columns" style={{ tableLayout: "auto" }}>
                            <thead>
                              <tr>
                                <th>Checkbox</th>
                                <th>Topic ID</th>
                                <th>Topic name(s)</th>
                                <th>Number of slots</th>
                                <th>Available slots</th>
                                <th>Num of waitlist</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <input type="checkbox"></input>
                                </td>
                                <td>E21222</td>
                                <td>Refactor impersonate_controller.rb</td>
                                <td>1</td>
                                <td>0</td>
                                <td>1</td>
                              </tr>
                            </tbody>
                          </Table>
                        )}
                      </div>
                    </FormGroup>
                  </Tab>
                  <Tab
                    eventKey="rubrics"
                    title={<span style={getTabTitleStyle("rubrics")}>Rubrics</span>}
                  >
                    <FormGroup>
                      <FormCheck
                        id="topic-suggestion"
                        type="checkbox"
                        name="topic-suggestion"
                        label="Review rubric varies by round"
                      />
                      <FormCheck
                        id="review-anonymous"
                        type="checkbox"
                        name="enable-bidding"
                        label="Review rubric varies by topic"
                      />
                      <FormCheck
                        id="review-by-teams"
                        type="checkbox"
                        name="enable-author-review-others"
                        label="Review rubric varies by role"
                      />
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Questionnaire</th>
                            <th>Use-dropdown instead</th>
                            <th>Scored-question display style</th>
                            <th>Weight</th>
                            <th>Notification limit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td>
                                <Row>
                                  <Col xs={4}>
                                    <div>
                                      <p>Review Round 1:</p>
                                      <p>This is the paragraph for Review Round 1.</p>
                                      <p>Tag prompt</p>
                                    </div>
                                  </Col>
                                  <Col xs={8}>
                                    {row.tagPrompts.map((tag, tagIndex) => (
                                      <div key={tagIndex} className="d-flex align-items-center">
                                        <div className="mr-3">
                                          <FormGroup className="mb-0">
                                            <FormLabel className="mr-2">Tag prompt</FormLabel>
                                            <FormControl
                                              as="select"
                                              value={tag.selectedOption}
                                              onChange={(e) =>
                                                handleDropdownChange(
                                                  rowIndex,
                                                  tagIndex,
                                                  e.target.value
                                                )
                                              }
                                            >
                                              <option>Select</option>
                                              <option>Option 1</option>
                                              <option>Option 2</option>
                                              <option>Option 3</option>
                                            </FormControl>
                                          </FormGroup>
                                        </div>
                                        <div className="mr-3">
                                          <FormGroup className="mb-0">
                                            <FormLabel className="mr-2">
                                              Apply to question type
                                            </FormLabel>
                                            <FormControl as="select">
                                              <option>Select</option>
                                              <option>Question Type 1</option>
                                              <option>Question Type 2</option>
                                              <option>Question Type 3</option>
                                            </FormControl>
                                          </FormGroup>
                                        </div>
                                        <div className="mr-3">
                                          <FormGroup className="mb-0">
                                            <FormLabel className="mr-2">
                                              comment length threshold
                                            </FormLabel>
                                            <FormControl type="number" style={{ width: "50px" }} />
                                          </FormGroup>
                                        </div>
                                        <Button
                                          variant="danger"
                                          size="sm"
                                          onClick={() => handleRemoveTagPrompt(rowIndex, tagIndex)}
                                          className="ml-3"
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="primary"
                                      onClick={() => handleAddTagPrompt(rowIndex)}
                                    >
                                      Add Tag Prompt
                                    </Button>
                                  </Col>
                                </Row>
                              </td>
                              <td>
                                <FormCheck type="checkbox" />
                              </td>
                              <td>
                                <FormControl
                                  as="select"
                                  value={row.useDropdown}
                                  onChange={(e) =>
                                    handleUseDropdownChange(rowIndex, e.target.value)
                                  }
                                >
                                  <option>Select</option>
                                  <option>Dropdown Option 1</option>
                                  <option>Dropdown Option 2</option>
                                  <option>Dropdown Option 3</option>
                                </FormControl>
                              </td>
                              <td>
                                <FormGroup
                                  controlId="weight"
                                  style={{ display: "flex", flexDirection: "row" }}
                                >
                                  <FormControl type="number" style={{ width: "50px" }} />
                                  <FormLabel>%</FormLabel>
                                </FormGroup>
                              </td>
                              <td>
                                <FormGroup
                                  controlId="weight"
                                  style={{ display: "flex", flexDirection: "row" }}
                                >
                                  <FormControl type="number" style={{ width: "50px" }} />
                                  <FormLabel>%</FormLabel>
                                </FormGroup>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </FormGroup>
                  </Tab>
                  <Tab
                    eventKey="review-strategy"
                    title={<span style={getTabTitleStyle("review-strategy")}>Review Strategy</span>}
                  >
                    <FormGroup
                      controlId="max-team-members"
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <FormLabel style={{ marginRight: "10px" }}>Review strategy</FormLabel>
                      <FormControl as="select" name="course" style={{ width: "120px" }}>
                        <option value="auto">Auto-Selected</option>
                        <option value="review2">Review 2</option>
                      </FormControl>
                    </FormGroup>
                    <FormGroup
                      controlId="review-topic-threshold"
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <FormLabel style={{ marginRight: "10px" }}>
                        Review Topic Threshold (k):?
                      </FormLabel>
                      <FormControl type="number" name="digitInput" style={{ width: "50px" }} />
                    </FormGroup>
                    <FormGroup
                      controlId="set-required-no-of-reviews"
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <FormLabel style={{ marginRight: "10px" }}>
                        Maximum number of reviews per reviewer
                      </FormLabel>
                      <FormControl type="number" name="digitInput" style={{ width: "50px" }} />
                    </FormGroup>

                    <FormCheck
                      id="review-limit"
                      type="checkbox"
                      name="review-limit"
                      label="Has max review limit?"
                    />
                    <FormGroup
                      controlId="set-allowed-no-of-reviews"
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <FormLabel style={{ marginRight: "10px" }}>
                        Set allowed number of reviews per reviewer
                      </FormLabel>
                      <FormControl type="number" name="digitInput" style={{ width: "50px" }} />
                    </FormGroup>
                    <FormGroup
                      controlId="set-required-no-of-reviews"
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <FormLabel style={{ marginRight: "10px" }}>
                        Set required number of reviews per reviewer
                      </FormLabel>
                      <FormControl type="number" name="digitInput" style={{ width: "50px" }} />
                    </FormGroup>
                    <FormCheck
                      id="topic-suggestion"
                      type="checkbox"
                      name="topic-suggestion"
                      label="Allow topic suggestions from students?"
                    />
                    <FormCheck
                      id="review-anonymous"
                      type="checkbox"
                      name="enable-bidding"
                      label="Is Review Anonymous?"
                    />
                    <FormCheck
                      id="review-by-teams"
                      type="checkbox"
                      name="enable-author-review-others"
                      label="Is Review done by Teams?"
                    />
                    <FormCheck
                      id="self-reviews"
                      type="checkbox"
                      name="allow-reviewer-to-topic"
                      label="Allow Self Reviews?"
                    />
                    <FormCheck
                      id="role-based-reviewing"
                      type="checkbox"
                      name="create-boomarks"
                      label="Is Role-based Reviewing?"
                    />
                    <FormCheck
                      id="bidding-for-reviewers"
                      type="checkbox"
                      name="bidding-for-reviewers"
                      label="Allow reviews to be begun in later rounds."
                    />
                  </Tab>
                  <Tab
                    eventKey="due-date"
                    title={<span style={getTabTitleStyle("due-date")}>Due date</span>}
                  >
                    <FormGroup>
                      <FormGroup
                        controlId="review-rounds"
                        style={{ display: "flex", flexDirection: "row" }}
                      >
                        <FormLabel style={{ marginRight: "10px" }}>
                          Number of review rounds:
                        </FormLabel>
                        <FormControl type="number" name="digitInput" style={{ width: "50px" }} />
                      </FormGroup>
                      <FormCheck
                        id="topic-suggestion"
                        type="checkbox"
                        name="topic-suggestion"
                        label="Name and description URL vary by round"
                      />
                      <FormCheck
                        id="review-anonymous"
                        type="checkbox"
                        name="enable-bidding"
                        label="Use signup deadline"
                      />
                      <FormCheck
                        id="review-by-teams"
                        type="checkbox"
                        name="enable-author-review-others"
                        label="Use drop topic deadline"
                      />
                      <FormCheck
                        id="self-reviews"
                        type="checkbox"
                        name="allow-reviewer-to-topic"
                        label="Use team formation deadline"
                      />
                      <FormCheck
                        id="role-based-reviewing"
                        type="checkbox"
                        name="create-boomarks"
                        label="Use meta-review deadline"
                      />
                      <Button onClick={toggleTableVisibility}>
                        {isTableVisible ? "Hide Table" : "Show Table"}
                      </Button>
                      <div></div>
                      <FormCheck
                        id="apply-late-policy"
                        type="checkbox"
                        name="apply-late-policy"
                        label="Apply late policy"
                      />
                      <FormGroup
                        controlId="late-policy-dropdown"
                        className="d-flex align-items-center"
                      >
                        <FormLabel className="mr-2 mb-0">Apply late policy</FormLabel>
                        <FormControl
                          as="select"
                          className="custom-select custom-select-sm"
                          style={{ width: "100px" }}
                        >
                          <option value="none">None</option>
                          <option value="deadline1">Late Deadline1</option>
                        </FormControl>
                      </FormGroup>
                    </FormGroup>
                  </Tab>
                  <Tab eventKey="etc" title={<span style={getTabTitleStyle("etc")}>Etc.</span>}>
                    <Container>
                      <div className="row">
                        <div className="col-sm-6 col-md-4 col-lg-3 mb-3">
                          <Button
                            variant="primary"
                            style={{ fontSize: "1.2rem", padding: "6px 10px" }}
                          >
                            <img
                              src="/assets/icons/add-participant-24.png"
                              alt="Logo"
                              className="mr-1"
                              style={{ width: "20px", height: "20px" }}
                            />
                            Add participant
                          </Button>
                        </div>
                        <div className="col-sm-6 col-md-4 col-lg-3 mb-3">
                          <Button
                            variant="primary"
                            style={{ fontSize: "1.2rem", padding: "6px 10px" }}
                          >
                            <img
                              src="/assets/icons/create-teams-24.png"
                              alt="Logo"
                              className="mr-1"
                              style={{ width: "20px", height: "20px" }}
                            />
                            Create Teams
                          </Button>
                        </div>
                        <div className="col-sm-6 col-md-4 col-lg-3 mb-3">
                          <Button
                            variant="primary"
                            style={{ fontSize: "1.2rem", padding: "6px 10px" }}
                          >
                            <img
                              src="/assets/icons/assign-reviewers-96.png"
                              alt="Logo"
                              className="mr-1"
                              style={{ width: "20px", height: "20px" }}
                            />
                            Assign Reviewer
                          </Button>
                        </div>
                        <div className="col-sm-6 col-md-4 col-lg-3 mb-3">
                          <Button
                            variant="primary"
                            style={{ fontSize: "1.2rem", padding: "6px 10px" }}
                          >
                            <img
                              src="/assets/icons/view-submissions-24.png"
                              alt="Logo"
                              className="mr-1"
                              style={{ width: "20px", height: "20px" }}
                            />
                            View submissions
                          </Button>
                        </div>
                        <div className="col-sm-6 col-md-4 col-lg-3 mb-3">
                          <Button
                            variant="primary"
                            style={{ fontSize: "1.2rem", padding: "6px 10px" }}
                          >
                            <img
                              src="/assets/icons/view-scores-24.png"
                              alt="Logo"
                              className="mr-1"
                              style={{ width: "20px", height: "20px" }}
                            />
                            View scores
                          </Button>
                        </div>
                        <div className="col-sm-6 col-md-4 col-lg-3 mb-3">
                          <Button
                            variant="primary"
                            style={{ fontSize: "1.2rem", padding: "6px 10px" }}
                          >
                            <img
                              src="/assets/icons/view-delayed-mailer.png"
                              alt="Logo"
                              className="mr-1"
                              style={{ width: "20px", height: "20px" }}
                            />
                            View delayed jobs
                          </Button>
                        </div>
                      </div>
                    </Container>
                  </Tab>
                </Tabs>
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
              </Form>
            );
          }}
        </Formik>
      </Container>
    </div>
  );
};

export default AssignmentEditor;

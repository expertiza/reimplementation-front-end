import axiosClient from "../../utils/axios_client";
import React, { useEffect, useState } from "react";
import { Button, Container, Row, Col } from 'react-bootstrap';
import AlertMessage from "components/Alert";
import { Outlet, useLoaderData } from "react-router-dom";
import { IUserResponse } from "../../utils/interfaces";
import ErrorPage from "../../router/ErrorPage";
import { loadAssignment } from "pages/Assignments/AssignmentUtil";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";

// Interfaces for team and alert message
interface ITeam {
  id: number;
  name: string;
  assignment_id: number;
  participants: IUserResponse[];
}

interface IAlertProps {
  variant: string;
  title?: string;
  message: string;
}

// Form validation
const validationSchema = Yup.object({
  grade: Yup.number()
    .min(0, "Grade must be between 0 and 100")
    .max(100, "Grade must be between 0 and 100")
    .required("Grade is required"),
  comment: Yup.string().required("Comment is required"),
});

const AssignGrades: React.FC = () => {
  const token = localStorage.getItem("token");
  const participant: any = useLoaderData();
  const [error, setError] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [team, setTeam] = useState<ITeam>();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<IAlertProps | null>(null);

  const toggleSubmission = () => {
    setShowSubmission(!showSubmission);
  };

  // handle form submission
  const handleSubmit = async (values: { grade: number | ""; comment: string }) => {
    try {
      await axiosClient.post(
        `/participants/${participant.id}/grade`,
        {
          grade: values.grade,
          comment: values.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAlert({
        variant: "success",
        title: "Success",
        message: "Grade and comment successfully saved!",
      });
    } catch (error) {
      console.error("Error saving grade and comment:", error);
      setAlert({
        variant: "danger",
        title: "Error",
        message: "Failed to save grade and comment.",
      });
    }
  };

  // fetch team data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (participant.team_id) {
          const teamResponse = await axiosClient.get(`/assignments/${participant.assignment_id}/teams/${participant.team_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });
          setTeam(teamResponse.data);
        }
      } catch (error) {
        console.error(error);
        setError(true);
      }
    };

    fetchData();
  }, [participant, token]);

  // fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        if (participant.assignment_id) {
          const data = await loadAssignment({ params: { id: participant.assignment_id } });
          setAssignment(data);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [participant]);

  if (loading) return <p>Loading assignment...</p>;
  if (error) return <ErrorPage />;

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Summary Report for {assignment?.name}</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col>
              {alert && <AlertMessage {...alert} />}
              {team && <h3><b>Team</b>: {team.name}</h3>}

              {/* FIX ME: Calculate the average peer review score */}
              <h4>Average Peer Review Score:</h4>

              <Button variant="outline-info" size="sm" onClick={toggleSubmission} className="mt-3 mb-3">
                {showSubmission ? "Hide Submission" : "Show Submission"}
              </Button>
              <br />


              {/* FIX ME: Fetch and show submission links */}
              {showSubmission && (
                <div>
                  No Submission Available
                  <br />
                </div>
              )}

              {/* FIX ME: Show items from reviews and calculate average for each item */}

              {/* Form for submitting grade and feedback */}
              <Formik
                initialValues={{
                  grade: "",
                  comment: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, handleChange, errors, touched, handleSubmit }) => (
                  <Form onSubmit={handleSubmit}>
                    <h5>Grade</h5>
                    <Field
                      name="grade"
                      type="number"
                      className="form-control width-150"
                      placeholder="Grade"
                      value={values.grade}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      required
                    />
                    {errors.grade && touched.grade && <div className="text-danger">{errors.grade}</div>}

                    <br />

                    <h5>Comments</h5>
                    <Field
                      name="comment"
                      as="textarea"
                      className="form-control width-500"
                      placeholder="Comment"
                      value={values.comment}
                      onChange={handleChange}
                      required
                      style={{ marginBottom: "0", paddingBottom: "0" }}
                    />
                    {errors.comment && touched.comment && <div className="text-danger">{errors.comment}</div>}

                    <br />

                    <Button type="submit" variant="primary">
                      Save
                    </Button>
                  </Form>
                )}
              </Formik>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default AssignGrades;

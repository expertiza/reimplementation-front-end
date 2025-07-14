import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { BsFileText } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "../../store/store";
import { IAssignmentResponse } from "../../utils/interfaces";
import { assignmentColumns as ASSIGNMENT_COLUMNS } from "./AssignmentColumns";
import DeleteAssignment from "./AssignmentDelete";


const Assignments = () => {
  const { error, isLoading, data: assignmentResponse, sendRequest: fetchAssignments } = useAPI();
  const { data: coursesResponse, sendRequest: fetchCourses } = useAPI();


  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IAssignmentResponse;
  }>({ visible: false });

  /**
   * At this moment the backend has deviated substantially from what the frontend
   * assignment creator provides. However, the backend also does not accept an instructor_id
   * when creating an assignment which is a required field so there is no way to create an 
   * assignment using the frontend. This function is a placeholder to generate fake assignments
   * until the backend is updated to allow for the creation of assignments.
   */
  const generateFakeAssignments = useCallback(() => {
    return Array.from({ length: 10 + Math.floor(Math.random() * 10) }, (_, idx) => ({
      id: idx + 1000,
      name: "Fake Assignment " + (idx + 1),
      description: "This is a fake assignment",
      course_id: idx + 999,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      courseName: "Fake Course " + (idx + 1),
    }));
  }, []);


  const fetchData = useCallback(async () => {
    try {
      const [assignments, courses] = await Promise.all([
        fetchAssignments({ url: `/assignments` }),
        fetchCourses({ url: '/courses' }),
      ]);
      // Handle the responses as needed
    } catch (err) {
      // Handle any errors that occur during the fetch
      console.error("Error fetching data:", err);
    }
  }, [fetchAssignments, fetchCourses]);

  useEffect(() => {
    if (!showDeleteConfirmation.visible) {
      fetchData();
    }
  }, [fetchData, showDeleteConfirmation.visible, auth.user.id]);

  let mergedData: Array<any & { courseName?: string }> = [];

  if (assignmentResponse && coursesResponse) {
    mergedData = assignmentResponse.data.map((assignment: any) => {
      const course = coursesResponse.data.find((c: any) => c.id === assignment.course_id);
      return { ...assignment, courseName: course ? course.name : 'Unknown' };
    });
  
    const fakeAssignments = generateFakeAssignments();
    mergedData = mergedData.concat(fakeAssignments);
  }
  

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteAssignmentHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<IAssignmentResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IAssignmentResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => ASSIGNMENT_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );

  const tableData = useMemo(
    () => (isLoading || !mergedData?.length ? [] : mergedData),
    [mergedData, isLoading]
  );

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage Assignments</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col md={{ span: 1, offset: 11 }}>
              <Button variant="outline-info" onClick={() => navigate("new")} className="d-flex align-items-center">
                <span className="me-1">Create</span><BsFileText />
              </Button>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteAssignment assignmentData={showDeleteConfirmation.data!} onClose={onDeleteAssignmentHandler} />
            )}
          </Row>
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              columnVisibility={{
                id: false,
              }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Assignments;
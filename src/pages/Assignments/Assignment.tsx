import { Button, Col, Container, Row } from "react-bootstrap";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { assignmentColumns as ASSIGNMENT_COLUMNS } from "./AssignmentColumns";
import { BsFileText } from "react-icons/bs";
import DeleteAssignment from "./AssignmentDelete";
import { IAssignmentResponse } from "../../utils/interfaces";
import { RootState } from "../../store/store";
import { Row as TRow } from "@tanstack/react-table";
import Table from "../../components/Table/Table";
import { alertActions } from "../../store/slices/alertSlice";
import useAPI from "../../hooks/useAPI";


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
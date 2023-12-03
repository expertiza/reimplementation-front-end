import { Button, Col, Container, Row } from "react-bootstrap";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { assignmentColumns as ASSIGNMENT_COLUMNS } from "./AssignmentColumns"; // Assuming you have assignmentColumns similar to userColumns
import { BsFileText } from "react-icons/bs"; // Assuming you have an appropriate icon for assignments
import DeleteAssignment from "./AssignmentDelete"; // Assuming you have an AssignmentDelete component
import { IAssignmentResponse } from "../../utils/interfaces"; // Assuming you have the interface for assignments
import { RootState } from "../../store/store";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";

const Assignments = () => {
  const { error, isLoading, data: assignmentResponse, sendRequest: fetchAssignments } = useAPI();
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

  useEffect(() => {
    if (!showDeleteConfirmation.visible) fetchAssignments({ url: `/assignments` });
  }, [fetchAssignments, location, showDeleteConfirmation.visible, auth.user.id]);

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
    () => ASSIGNMENT_COLUMNS(onEditHandle, onDeleteHandle), // Assuming you have assignmentColumns similar to userColumns
    [onDeleteHandle, onEditHandle]
  );

  const tableData = useMemo(
    () => (isLoading || !assignmentResponse?.data ? [] : assignmentResponse.data),
    [assignmentResponse?.data, isLoading]
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
              <Button variant="outline-info" onClick={() => navigate("new")}>
                <BsFileText />
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
                // Add other visibility conditions if needed for assignments
              }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Assignments;

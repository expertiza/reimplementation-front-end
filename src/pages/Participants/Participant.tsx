import { Row as TRow } from "@tanstack/react-table";
import Table from "../../components/Table/Table";
import useAPI from "../../hooks/useAPI";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { alertActions } from "../../store/slices/alertSlice";
import { RootState } from "../../store/store";
import { IParticipantResponse, ROLE } from "../../utils/interfaces";
import DeleteParticipant from "./ParticipantDelete";
import { transformAssignmentParticipant } from "./participantUtil";
import { participantColumns as PARPTICIPANT_COLUMNS } from "./participantColumns";

/**
 * @author Atharva Thorve on October, 2023
 */

interface IModel {
  type: "student_tasks" | "courses" | "assignments";
  id: Number;
}

const Participants: React.FC<IModel> = ({ type }) => {
  const { assignmentId } = useParams();
  const { error, isLoading, data: participantResponse, sendRequest: fetchParticipants } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IParticipantResponse;
  }>({ visible: false });

  useEffect(() => {
    if (!showDeleteConfirmation.visible && assignmentId)
      fetchParticipants({ url: `/participants/assignment/${assignmentId}` });
  }, [fetchParticipants, location, showDeleteConfirmation.visible, auth.user.id, assignmentId]);

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteParticipantHandler = useCallback(
    () => setShowDeleteConfirmation({ visible: false }),
    []
  );

  const onEditHandle = useCallback(
    (row: TRow<IParticipantResponse>) => navigate(`/${type}/participant/edit/${row.original.id}`),
    [navigate, type]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IParticipantResponse>) =>
      setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => PARPTICIPANT_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );

  const tableData = useMemo(
    () =>
      isLoading || !Array.isArray(participantResponse?.data)
        ? []
        : participantResponse!.data.map(transformAssignmentParticipant),
    [participantResponse?.data, isLoading]
  );

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h2>Manage Participants</h2>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col md={{ span: 1, offset: 11 }}>
              <Button className="btn btn-md" variant="success" onClick={() => navigate("new")}>
                <img src="/assets/icons/add-participant-24.png" alt="Add" width="16" height="16" />{" "}
                Add
              </Button>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteParticipant
                participantData={showDeleteConfirmation.data!}
                onClose={onDeleteParticipantHandler}
              />
            )}
          </Row>
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              columnVisibility={{
                id: false,
                institution: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
              }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Participants;

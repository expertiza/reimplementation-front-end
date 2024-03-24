import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { BsPersonFillAdd } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "../../store/store";
import { IParticipantResponse, ROLE } from "../../utils/interfaces";
import DeleteParticipant from "./ParticipantDelete";
import { participantColumns as PARPTICIPANT_COLUMNS } from "./participantColumns";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

/**
 * @author Atharva Thorve on October, 2023
 */

interface IModel {
  type: "student_tasks" | "courses" | "assignments";
}

const Participants: React.FC<IModel> = ({ type }) => {
  const tooltip = <Tooltip id="tooltip">Add Participant</Tooltip>;
  const { error, isLoading, data: participantResponse, sendRequest: fetchParticipants } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { typeId } = useParams();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IParticipantResponse;
  }>({ visible: false });

  useEffect(() => {
    if (!showDeleteConfirmation.visible)
      fetchParticipants({ url: `/${type}/${typeId}/participants` });
  }, [fetchParticipants, location, showDeleteConfirmation.visible, auth.user.id, type, typeId]);

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
    (row: TRow<IParticipantResponse>) =>
      navigate(`/${type}/${typeId}/participants/edit/${row.original.id}`),
    [navigate, type, typeId]
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

  let tableData = useMemo(
    () => (isLoading || !participantResponse?.data ? [] : participantResponse.data),
    [participantResponse?.data, isLoading]
  );

  console.log(participantResponse);

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage Participants</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col md={{ span: 1, offset: 11 }}>
              <OverlayTrigger overlay={tooltip} placement="bottom">
                <Button variant="outline-success" onClick={() => navigate("new")}>
                  <BsPersonFillAdd />
                </Button>
              </OverlayTrigger>
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

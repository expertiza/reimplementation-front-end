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
import ExportModal from "../../components/Modals/ExportModal";
import ImportModal from "../../components/Modals/ImportModal";
import DeleteParticipant from "./ParticipantDelete";
import { participantColumns as PARPTICIPANT_COLUMNS } from "./participantColumns";

/**
 * @author Atharva Thorve on October, 2023
 */

interface IModel {
  type: "student_tasks" | "courses" | "assignments";
  id: number;
}

const Participants: React.FC<IModel> = ({ type, id }) => {
  const { error, isLoading, data: participantResponse, sendRequest: fetchParticipants } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { assignmentId } = useParams();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IParticipantResponse;
  }>({ visible: false });
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const participantsUrl = useMemo(() => {
    if (type === "assignments" || type === "student_tasks") {
      return `/participants/assignment/${assignmentId ?? id}`;
    }

    return `/participants/${type}/${id}`;
  }, [assignmentId, id, type]);

  useEffect(() => {
    if (!showDeleteConfirmation.visible) fetchParticipants({ url: participantsUrl });
  }, [fetchParticipants, location, showDeleteConfirmation.visible, auth.user.id, participantsUrl]);

  const refreshParticipants = useCallback(() => {
    fetchParticipants({ url: participantsUrl });
  }, [fetchParticipants, participantsUrl]);

  const closeImportModal = useCallback(() => {
    setShowImportModal(false);
    refreshParticipants();
  }, [refreshParticipants]);

  const closeExportModal = useCallback(() => {
    setShowExportModal(false);
  }, []);

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
      navigate(`edit/${row.original.id}`, { state: { from: location.pathname } }),
    [location.pathname, navigate]
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
      isLoading || !participantResponse?.data
        ? []
        : participantResponse.data.map((participant: any) => {
            const user = participant.user || {};

            return {
              ...participant,
              name: participant.name ?? user.name ?? user.username ?? "",
              full_name: participant.full_name ?? user.full_name ?? user.fullName ?? "",
              email: participant.email ?? user.email ?? "",
              role: participant.role ?? user.role ?? { id: null, name: "" },
              parent: participant.parent ?? user.parent ?? { id: null, name: "" },
              institution: participant.institution ?? user.institution ?? { id: null, name: "" },
              email_on_review: participant.email_on_review ?? user.email_on_review ?? false,
              email_on_submission: participant.email_on_submission ?? user.email_on_submission ?? false,
              email_on_review_of_review:
                participant.email_on_review_of_review ??
                user.email_on_review_of_review ??
                false,
            };
          }),
    [participantResponse?.data, isLoading]
  );

  const assignmentContextParams = useMemo(
    () => ({
      assignment_id: assignmentId ?? id,
    }),
    [assignmentId, id]
  );

  return (
    <>
      <Outlet />
      <ImportModal
        show={showImportModal}
        onHide={closeImportModal}
        modelClass="AssignmentParticipant"
        contextParams={assignmentContextParams}
      />
      <ExportModal
        show={showExportModal}
        onHide={closeExportModal}
        modelClass="AssignmentParticipant"
        contextParams={assignmentContextParams}
      />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h2>Manage Participants</h2>
            </Col>
            <hr />
          </Row>
          <Row className="mb-3">
            <Col className="d-flex justify-content-end gap-2">
              {(type === "assignments" || type === "student_tasks") && (
                <>
                  <Button
                    className="btn btn-md"
                    variant="outline-secondary"
                    onClick={() => setShowImportModal(true)}
                  >
                    <img
                      src="/assets/icons/assign-survey-24.png"
                      alt="Import"
                      width="16"
                      height="16"
                    />{" "}
                    Import CSV
                  </Button>
                  <Button
                    className="btn btn-md"
                    variant="outline-secondary"
                    onClick={() => setShowExportModal(true)}
                  >
                    <img
                      src="/assets/icons/export-temp.png"
                      alt="Export"
                      width="16"
                      height="16"
                    />{" "}
                    Export CSV
                  </Button>
                </>
              )}
              <Button
                className="btn btn-md"
                variant="success"
                onClick={() => navigate("new", { state: { from: location.pathname } })}
              >
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

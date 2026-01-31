import React, { useCallback, useRef, useState, useEffect } from "react";
import { Alert, Col, Container, Row as BRow } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useParticipants } from "./useParticipants";
import { exportToCSV } from "./participantHelpers";
import ParticipantToolbar from "./ParticipantToolbar";
import ParticipantTable from "./ParticipantTable";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { Participant } from "./participantTypes";

const ParticipantsAPI: React.FC = () => {
  const [requireQuiz] = useState<boolean>(true);
  const [alert, setAlert] = useState<{
    variant: "success" | "info" | "danger";
    message: string;
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    participant: Participant | null;
  }>({
    show: false,
    participant: null,
  });

  const navigate = useNavigate();
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const {
    filteredParticipants,
    searchValue,
    setSearchValue,
    isLoading,
    fetchError,
    deleteError,
    updateRole,
    removeParticipant,
    importFromCSV,
    exportToCSV: getExportData,
  } = useParticipants({ assignmentId: 1 });

  useEffect(() => {
    if (fetchError) {
      showError(`Failed to fetch participants: ${fetchError}`);
    }
  }, [fetchError]);

  useEffect(() => {
    if (deleteError) {
      showError(`Failed to delete participant: ${deleteError}`);
    }
  }, [deleteError]);

  const showInfo = useCallback((message: string) => {
    setAlert({ variant: "info", message });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setAlert({ variant: "success", message });
  }, []);

  const showError = useCallback((message: string) => {
    setAlert({ variant: "danger", message });
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const closeAlert = useCallback(() => setAlert(null), []);

  const onRoleChange = useCallback(
    (id: number, newRoleId: number) => {
      updateRole(id, newRoleId);
      showSuccess("Role updated successfully");
    },
    [updateRole, showSuccess]
  );

  const onRemoveClick = useCallback((participant: Participant) => {
    setDeleteModal({ show: true, participant });
  }, []);

  const onConfirmDelete = useCallback(() => {
    if (deleteModal.participant) {
      const participantName = deleteModal.participant.name;
      removeParticipant(deleteModal.participant.id);
      showSuccess(`${participantName} removed successfully`);
    }
    setDeleteModal({ show: false, participant: null });
  }, [deleteModal.participant, removeParticipant, showSuccess]);

  const onCancelDelete = useCallback(() => {
    setDeleteModal({ show: false, participant: null });
  }, []);

  const onCopyFromCourse = useCallback(() => {
    showInfo("Copy from course triggered");
  }, [showInfo]);

  const onCopyToCourse = useCallback(() => {
    showInfo("Copy to course triggered");
  }, [showInfo]);

  const onImportClick = useCallback(() => importInputRef.current?.click(), []);

  const onBack = useCallback(() => navigate(-1), [navigate]);

  const onImportFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;

        const count = await importFromCSV(file);
        showSuccess(`Imported ${count} participants`);
      } catch (error) {
        showError("Import failed");
      } finally {
        e.target.value = "";
      }
    },
    [importFromCSV, showSuccess, showError]
  );

  const onExport = useCallback(() => {
    const headers = ["Username", "Name", "Email", "Parent", "Handle", "Role"];
    const data = getExportData().map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`));
    exportToCSV(data, headers, "participants.csv");
    showSuccess("Exported successfully");
  }, [getExportData, showSuccess]);

  return (
    <>
      <div
        style={{
          backgroundColor: "#f7fafc",
          minHeight: "100vh",
          paddingTop: "1.5rem",
          paddingBottom: "2rem",
        }}
      >
        <Container fluid style={{ maxWidth: "1600px" }}>
          <BRow className="mb-3">
            <Col>
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 700,
                  color: "#1a202c",
                  marginBottom: "0.25rem",
                }}
              >
                Manage Participants
              </h1>
              <p style={{ color: "#718096", fontSize: "0.9rem", marginBottom: 0 }}>
                View and manage assignment participants
              </p>
            </Col>
          </BRow>

          {alert && (
            <BRow className="mb-3">
              <Col>
                <Alert
                  variant={alert.variant}
                  onClose={closeAlert}
                  dismissible
                  style={{
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    padding: "0.875rem 1.25rem",
                    border: "none",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  className="alert-dismissible"
                >
                  <style>{`
                    .alert-dismissible .btn-close {
                      background: transparent;
                      opacity: 0.5;
                      transition: opacity 0.2s ease;
                    }
                    .alert-dismissible .btn-close:hover {
                      opacity: 1;
                      background: transparent;
                    }
                  `}</style>
                  {alert.message}
                </Alert>
              </Col>
            </BRow>
          )}

          <BRow className="mb-3">
            <Col>
              <ParticipantToolbar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onCopyFromCourse={onCopyFromCourse}
                onCopyToCourse={onCopyToCourse}
                onImportClick={onImportClick}
                onExport={onExport}
                onBack={onBack}
                importInputRef={importInputRef}
                onImportFileChange={onImportFileChange}
              />
            </Col>
          </BRow>

          <BRow>
            <Col>
              <ParticipantTable
                participants={filteredParticipants}
                isLoading={isLoading}
                requireQuiz={requireQuiz}
                onRoleChange={onRoleChange}
                onRemoveClick={onRemoveClick}
              />
            </Col>
          </BRow>
        </Container>
      </div>

      <DeleteConfirmationModal
        show={deleteModal.show}
        participant={deleteModal.participant}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
};

export default ParticipantsAPI;

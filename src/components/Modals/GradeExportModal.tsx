// src/components/Modals/GradeExportModal.tsx
import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import useAPI from "../../hooks/useAPI";
import { HttpMethod } from "../../utils/httpMethods";

/* ------------------------------------------------------------------ */
/*  Shared text style                                                   */
/* ------------------------------------------------------------------ */
const TABLE_TEXT: React.CSSProperties = {
  fontFamily: "verdana, arial, helvetica, sans-serif",
  color: "#333",
  fontSize: "15px",
  lineHeight: "1.428em",
};

const STANDARD_TEXT: React.CSSProperties = {
  fontFamily: "verdana, arial, helvetica, sans-serif",
  color: "#333",
  fontSize: "13px",
  lineHeight: "30px",
};

/* ------------------------------------------------------------------ */
/*  Export type options                                                 */
/* ------------------------------------------------------------------ */
type ExportType =
  | "export_assignment_grades"
  | "export_author_feedback_grades"
  | "export_teammate_review_grades";

const EXPORT_OPTIONS: { value: ExportType; label: string; description: string }[] = [
  {
    value: "export_assignment_grades",
    label: "Assignment Grades",
    description: "One row per team with the instructor-assigned grade and comment.",
  },
  {
    value: "export_author_feedback_grades",
    label: "Author Feedback Grades",
    description: "One row per participant with their average score from author feedback.",
  },
  {
    value: "export_teammate_review_grades",
    label: "Teammate Review Grades",
    description: "One row per participant with their average teammate-review score.",
  },
];

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
type GradeExportModalProps = {
  show: boolean;
  onHide: () => void;
  assignmentId: number | string;
};

/* ================================================================== */
/*  GradeExportModal Component                                         */
/* ================================================================== */
const GradeExportModal: React.FC<GradeExportModalProps> = ({
  show,
  onHide,
  assignmentId,
}) => {
  const [selectedType, setSelectedType] = useState<ExportType>("export_assignment_grades");
  const [status, setStatus] = useState<string>("");

  const { isLoading, sendRequest: fetchExport } = useAPI();

  /* Reset status when modal opens */
  React.useEffect(() => {
    if (show) setStatus("");
  }, [show]);

  /* Download helper — same pattern as ExportModal */
  const downloadFile = (csvData: string, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([csvData], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const onExport = async () => {
    if (!assignmentId) {
      setStatus("Assignment ID is missing.");
      return;
    }

    setStatus("Generating CSV…");

    try {
      const response = await fetchExport({
        url: `/grades/${assignmentId}/${selectedType}`,
        method: HttpMethod.GET,
      });

      // fetchExport stores the result in useAPI's `data`; we need the raw response
      // The hook returns void, so we rely on the data state — handled in useEffect below
    } catch (err: any) {
      setStatus(err.message || "Unexpected error.");
    }
  };

  /* Listen to API response via a separate hook call */
  const { data: exportResponse, error: exportError, sendRequest: doExport } = useAPI();

  const handleExport = async () => {
    if (!assignmentId) {
      setStatus("Assignment ID is missing.");
      return;
    }
    setStatus("Generating CSV…");
    await doExport({
      url: `/grades/${assignmentId}/${selectedType}`,
      method: HttpMethod.GET,
    });
  };

  React.useEffect(() => {
    if (exportResponse) {
      const { data: csvData, filename, message } = exportResponse.data;
      setStatus(message || "Export complete.");
      downloadFile(csvData, filename);
      setTimeout(onHide, 1500);
    } else if (exportError) {
      setStatus(exportError);
    }
  }, [exportResponse, exportError]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      keyboard
      contentClassName="border border-2"
    >
      <Modal.Header closeButton style={{ ...STANDARD_TEXT, background: "#f7f8fa" }}>
        <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>
          Export Grades
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ ...STANDARD_TEXT }}>
        <Form.Label className="fw-semibold" style={TABLE_TEXT}>
          Select grade type to export
        </Form.Label>

        {EXPORT_OPTIONS.map((opt) => (
          <div key={opt.value} className="mb-2">
            <Form.Check
              type="radio"
              name="grade_export_type"
              id={`grade-export-${opt.value}`}
              label={<strong style={TABLE_TEXT}>{opt.label}</strong>}
              checked={selectedType === opt.value}
              onChange={() => setSelectedType(opt.value)}
              style={TABLE_TEXT}
            />
            <div style={{ ...TABLE_TEXT, color: "#666", paddingLeft: 24, fontSize: 13 }}>
              {opt.description}
            </div>
          </div>
        ))}

        {status && (
          <Row className="mt-3">
            <Col>
              <div style={{ ...TABLE_TEXT }}>
                <strong>Status:</strong> {status}
              </div>
            </Col>
          </Row>
        )}
      </Modal.Body>

      <Modal.Footer style={{ ...STANDARD_TEXT }}>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleExport} disabled={isLoading}>
          Export
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GradeExportModal;

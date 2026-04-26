import React, { useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import axiosClient from "../../utils/axios_client";

type QuestionnairePackageExportModalProps = {
  show: boolean;
  onHide: () => void;
  selectedQuestionnaires?: Array<{
    id?: number;
    name?: string;
  }>;
  initialScope?: "selected" | "all";
};

const QuestionnairePackageExportModal: React.FC<QuestionnairePackageExportModalProps> = ({ show, onHide, selectedQuestionnaires = [], initialScope = "selected" }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState("");
  const [scope, setScope] = useState<"selected" | "all">(initialScope);

  const canExportSelected = useMemo(
    () => selectedQuestionnaires.some((questionnaire) => typeof questionnaire.id === "number"),
    [selectedQuestionnaires]
  );

  React.useEffect(() => {
    if (show) {
      setScope(initialScope);
      setStatus("");
    }
  }, [initialScope, show]);

  const downloadPackage = (filename: string, encodedData: string, contentType: string) => {
    const binary = atob(encodedData);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    const blob = new Blob([bytes], { type: contentType || "application/zip" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const onExport = async () => {
    setIsExporting(true);
    setStatus("Generating questionnaire template package...");

    try {
      const payload =
        scope === "selected" && canExportSelected
          ? { questionnaire_ids: selectedQuestionnaires.map((questionnaire) => questionnaire.id).filter((id) => typeof id === "number") }
          : { export_all: true };

      const response = await axiosClient.post("/questionnaire_packages/export", payload, {
        timeout: 120000
      });
      downloadPackage(response.data.filename, response.data.data, response.data.content_type);
      setStatus(response.data.message);
      setTimeout(() => onHide(), 800);
    } catch (error: any) {
      setStatus(error?.response?.data?.error || error?.message || "Failed to export questionnaire template package.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Export Questionnaire Template Package</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Export questionnaires, their items, and question advices as a single zip package of CSV files.
          Answers, responses, and quiz data are excluded from this template package.
        </p>
        <Form.Group className="mb-3">
          <Form.Label>Export scope</Form.Label>
          <Form.Check
            type="radio"
            id="questionnaire-export-selected"
            label={
              canExportSelected
                ? `Selected questionnaires: ${selectedQuestionnaires.map((questionnaire) => questionnaire.name).join(", ")}`
                : "Selected questionnaires (select one or more questionnaire rows first)"
            }
            checked={scope === "selected"}
            disabled={!canExportSelected}
            onChange={() => setScope("selected")}
          />
          <Form.Check
            type="radio"
            id="questionnaire-export-all"
            label="All questionnaires"
            checked={scope === "all"}
            onChange={() => setScope("all")}
          />
        </Form.Group>
        {status && <div>{status}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={isExporting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onExport} disabled={isExporting}>
          Export Template Package
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuestionnairePackageExportModal;

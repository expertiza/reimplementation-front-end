import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import axiosClient from "../../utils/axios_client";

type QuestionnairePackageImportModalProps = {
  show: boolean;
  onHide: () => void;
  onImported: () => Promise<void> | void;
};

const QuestionnairePackageImportModal: React.FC<QuestionnairePackageImportModalProps> = ({ show, onHide, onImported }) => {
  const [importMode, setImportMode] = useState<"package" | "csv">("csv");
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [questionnaireFile, setQuestionnaireFile] = useState<File | null>(null);
  const [itemsFile, setItemsFile] = useState<File | null>(null);
  const [questionAdvicesFile, setQuestionAdvicesFile] = useState<File | null>(null);
  const [duplicateAction, setDuplicateAction] = useState("");
  const [duplicateActions, setDuplicateActions] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!show) return;

    setImportMode("csv");
    setPackageFile(null);
    setQuestionnaireFile(null);
    setItemsFile(null);
    setQuestionAdvicesFile(null);
    setStatus("");

    axiosClient.get("/questionnaire_packages/config")
      .then((response) => {
        const actions = response.data.available_actions_on_dup || [];
        setDuplicateActions(actions);
        setDuplicateAction(actions[0] || "");
      })
      .catch((error) => {
        setStatus(error?.response?.data?.error || error?.message || "Failed to load import configuration.");
      });
  }, [show]);

  const onImport = async () => {
    if (importMode === "package" && !packageFile) {
      setStatus("Please select a questionnaire template package zip file.");
      return;
    }

    if (importMode === "csv" && !questionnaireFile) {
      setStatus("Please select a questionnaire CSV file.");
      return;
    }

    setIsImporting(true);
    setStatus("Importing questionnaire template package...");

    try {
      const formData = new FormData();
      if (importMode === "package" && packageFile) {
        formData.append("package_file", packageFile);
      } else {
        formData.append("questionnaire_file", questionnaireFile!);
        if (itemsFile) {
          formData.append("items_file", itemsFile);
        }
        if (questionAdvicesFile) {
          formData.append("question_advices_file", questionAdvicesFile);
        }
      }
      if (duplicateAction) {
        formData.append("dup_action", duplicateAction);
      }

      const response = await axiosClient.post("/questionnaire_packages/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000
      });

      setStatus(response.data.message);
      await onImported();
      setTimeout(() => onHide(), 800);
    } catch (error: any) {
      setStatus(error?.response?.data?.error || error?.message || "Failed to import questionnaire template package.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Import Questionnaire Template Package</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Import an exported package zip, or upload CSV files into the matching fields.
        </p>

        <Form.Group className="mb-3">
          <Form.Label>Import source</Form.Label>
          <Form.Check
            type="radio"
            id="questionnaire-import-csv"
            label="Separate CSV files"
            checked={importMode === "csv"}
            onChange={() => setImportMode("csv")}
          />
          <Form.Check
            type="radio"
            id="questionnaire-import-package"
            label="Exported zip package"
            checked={importMode === "package"}
            onChange={() => setImportMode("package")}
          />
        </Form.Group>

        {importMode === "package" ? (
        <Form.Group className="mb-3">
          <Form.Label>Package file</Form.Label>
          <Form.Control
            type="file"
            accept=".zip,application/zip"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPackageFile(event.target.files?.[0] ?? null)}
          />
        </Form.Group>
        ) : (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Questionnaires CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,text/csv"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuestionnaireFile(event.target.files?.[0] ?? null)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Items CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,text/csv"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setItemsFile(event.target.files?.[0] ?? null)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Question Advices CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,text/csv"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuestionAdvicesFile(event.target.files?.[0] ?? null)}
              />
            </Form.Group>
          </>
        )}

        {duplicateActions.length > 0 && (
          <Form.Group className="mb-3">
            <Form.Label>Duplicate handling</Form.Label>
            {duplicateActions.map((action) => (
              <Form.Check
                key={action}
                type="radio"
                label={action}
                name="questionnaire-package-duplicate-action"
                checked={duplicateAction === action}
                onChange={() => setDuplicateAction(action)}
              />
            ))}
          </Form.Group>
        )}

        {status && <div>{status}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={isImporting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onImport} disabled={isImporting}>
          Import Template Package
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuestionnairePackageImportModal;

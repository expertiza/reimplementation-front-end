import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import axiosClient from "../../utils/axios_client";

type QuestionnairePackageImportModalProps = {
  show: boolean;
  onHide: () => void;
  onImported: () => Promise<void> | void;
};

const QuestionnairePackageImportModal: React.FC<QuestionnairePackageImportModalProps> = ({ show, onHide, onImported }) => {
  const [file, setFile] = useState<File | null>(null);
  const [duplicateAction, setDuplicateAction] = useState("");
  const [duplicateActions, setDuplicateActions] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!show) return;

    setFile(null);
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
    if (!file) {
      setStatus("Please select a questionnaire template package zip file.");
      return;
    }

    setIsImporting(true);
    setStatus("Importing questionnaire template package...");

    try {
      const formData = new FormData();
      formData.append("package_file", file);
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
          Import a questionnaire template package zip containing questionnaire, item, and question advice CSVs.
        </p>
        <Form.Group className="mb-3">
          <Form.Label>Package file</Form.Label>
          <Form.Control
            type="file"
            accept=".zip,application/zip"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)}
          />
        </Form.Group>

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

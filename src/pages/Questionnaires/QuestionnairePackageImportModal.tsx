import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ColumnDef } from "@tanstack/react-table";
import PreviewTable from "../../components/Table/Table";
import axiosClient from "../../utils/axios_client";

type QuestionnairePackageImportModalProps = {
  show: boolean;
  onHide: () => void;
  onImported: () => Promise<void> | void;
};

type ImportPreview = {
  summary: Record<string, number>;
  questionnaires: any[];
  items: any[];
  question_advices: any[];
  errors: Array<{ file: string; row: number; message: string }>;
};

type CsvHeaderRequirements = Record<string, string[]>;

const previewTableColumns: ColumnDef<any, any>[] = [
  {
    header: "File",
    accessorKey: "file"
  },
  {
    header: "Row",
    accessorKey: "row"
  },
  {
    header: "Action",
    accessorKey: "action"
  },
  {
    header: "Record",
    accessorKey: "record"
  },
  {
    header: "Message",
    accessorKey: "message",
    cell: (info: any) => info.getValue() || "-"
  }
];

const duplicateActionTooltip = (action: string) => {
  if (action === "SkipRecordAction") {
    return "Skip importing questionnaires that already exist in the system.";
  }
  if (action === "UpdateExistingRecordAction") {
    return "Update matching questionnaires with template fields from the import package.";
  }
  if (action === "ChangeOffendingFieldAction") {
    return "Rename duplicate questionnaires before importing them as copies.";
  }

  return "Controls how duplicate questionnaires are handled during import.";
};

const QuestionnairePackageImportModal: React.FC<QuestionnairePackageImportModalProps> = ({ show, onHide, onImported }) => {
  const [importMode, setImportMode] = useState<"package" | "csv">("csv");
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [questionnaireFile, setQuestionnaireFile] = useState<File | null>(null);
  const [itemsFile, setItemsFile] = useState<File | null>(null);
  const [questionAdvicesFile, setQuestionAdvicesFile] = useState<File | null>(null);
  const [duplicateAction, setDuplicateAction] = useState("");
  const [duplicateActions, setDuplicateActions] = useState<string[]>([]);
  const [templateNames, setTemplateNames] = useState<string[]>([]);
  const [csvHeaderRequirements, setCsvHeaderRequirements] = useState<CsvHeaderRequirements>({});
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [status, setStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const previewTableData = useMemo(() => {
    if (!preview) return [];

    return [
      ...preview.questionnaires.map((row) => ({
        file: "Questionnaires",
        row: row.row,
        action: row.action,
        record: row.name,
        message: row.message
      })),
      ...preview.items.map((row) => ({
        file: "Items",
        row: row.row,
        action: row.action,
        record: row.txt,
        message: row.message
      })),
      ...preview.question_advices.map((row) => ({
        file: "Question Advices",
        row: row.row,
        action: row.action,
        record: row.advice,
        message: row.message
      }))
    ];
  }, [preview]);

  useEffect(() => {
    if (!show) return;

    setImportMode("csv");
    setPackageFile(null);
    setQuestionnaireFile(null);
    setItemsFile(null);
    setQuestionAdvicesFile(null);
    setTemplateNames([]);
    setCsvHeaderRequirements({});
    setPreview(null);
    setStatus("");

    axiosClient.get("/questionnaire_packages/config")
      .then((response) => {
        const actions = response.data.available_actions_on_dup || [];
        setDuplicateActions(actions);
        setDuplicateAction(actions[0] || "");
        setTemplateNames(response.data.available_templates || []);
        setCsvHeaderRequirements(response.data.csv_header_requirements || {});
      })
      .catch((error) => {
        setStatus(error?.response?.data?.error || error?.message || "Failed to load import configuration.");
      });
  }, [show]);

  const resetPreview = () => {
    setPreview(null);
    setStatus("");
  };

  const formatTemplateLabel = (templateName: string) => {
    if (templateName === "package") return "Download Sample Package Zip";

    return `Download Sample ${templateName.replace(/_/g, " ")} CSV`;
  };

  const formatHeaderGroupLabel = (headerGroup: string) => `${headerGroup.replace(/_/g, " ")} CSV`;

  const downloadTemplate = async (templateName: string) => {
    try {
      const response = await axiosClient.get(`/questionnaire_packages/templates/${templateName}`, {
        timeout: 120000
      });
      const binary = atob(response.data.data);
      const bytes = new Uint8Array(binary.length);

      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const blob = new Blob([bytes], { type: response.data.content_type || "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = response.data.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setStatus(error?.response?.data?.error || error?.message || "Failed to download questionnaire package template.");
    }
  };

  const buildImportFormData = () => {
    if (importMode === "package" && !packageFile) {
      setStatus("Please select a questionnaire template package zip file.");
      return null;
    }

    if (importMode === "csv" && !questionnaireFile) {
      setStatus("Please select a questionnaire CSV file.");
      return null;
    }

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

    return formData;
  };

  const onPreview = async () => {
    const formData = buildImportFormData();
    if (!formData) return;

    setIsPreviewing(true);
    setStatus("Previewing questionnaire template package...");

    try {
      const response = await axiosClient.post("/questionnaire_packages/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000
      });

      setPreview(response.data);
      setStatus("Preview generated.");
    } catch (error: any) {
      setPreview(null);
      setStatus(error?.response?.data?.error || error?.message || "Failed to preview questionnaire template package.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const onImport = async () => {
    const formData = buildImportFormData();
    if (!formData) return;

    setIsImporting(true);
    setStatus("Importing questionnaire template package...");

    try {
      const response = await axiosClient.post("/questionnaire_packages/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000
      });

      setStatus(response.data.message);
      setPreview(null);
      await onImported();
      setTimeout(() => onHide(), 800);
    } catch (error: any) {
      setStatus(error?.response?.data?.error || error?.message || "Failed to import questionnaire template package.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Import Questionnaire Template Package</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Import an exported package zip, or upload CSV files into the matching fields.
        </p>

        {templateNames.length > 0 && (
          <Form.Group className="mb-3">
            <Form.Label>Sample imports</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {templateNames.map((templateName) => (
                <Button
                  key={templateName}
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => downloadTemplate(templateName)}
                  disabled={isImporting}
                >
                  {formatTemplateLabel(templateName)}
                </Button>
              ))}
            </div>
          </Form.Group>
        )}

        {Object.keys(csvHeaderRequirements).length > 0 && (
          <Form.Group className="mb-3">
            <Form.Label>Required fields</Form.Label>
            {Object.entries(csvHeaderRequirements).map(([headerGroup, headers]) => (
              <div key={headerGroup} className="mb-2">
                <strong>{formatHeaderGroupLabel(headerGroup)}:</strong> {headers.join(", ")}
              </div>
            ))}
          </Form.Group>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Import source</Form.Label>
          <Form.Check
            type="radio"
            id="questionnaire-import-csv"
            label="Separate CSV files"
            checked={importMode === "csv"}
            onChange={() => {
              setImportMode("csv");
              resetPreview();
            }}
          />
          <Form.Check
            type="radio"
            id="questionnaire-import-package"
            label="Exported zip package"
            checked={importMode === "package"}
            onChange={() => {
              setImportMode("package");
              resetPreview();
            }}
          />
        </Form.Group>

        {importMode === "package" ? (
        <Form.Group className="mb-3">
          <Form.Label>Package file</Form.Label>
            <Form.Control
              type="file"
              accept=".zip,application/zip"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPackageFile(event.target.files?.[0] ?? null);
              resetPreview();
            }}
          />
        </Form.Group>
        ) : (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Questionnaires CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,text/csv"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setQuestionnaireFile(event.target.files?.[0] ?? null);
                  resetPreview();
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Items CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,text/csv"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setItemsFile(event.target.files?.[0] ?? null);
                  resetPreview();
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Question Advices CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,text/csv"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setQuestionAdvicesFile(event.target.files?.[0] ?? null);
                  resetPreview();
                }}
              />
            </Form.Group>
          </>
        )}

        {duplicateActions.length > 0 && (
          <Form.Group className="mb-3">
            <Form.Label>Duplicate handling</Form.Label>
            {duplicateActions.map((action) => (
              <div key={action} className="d-flex align-items-center mb-1">
                <Form.Check
                  type="radio"
                  label={action}
                  name="questionnaire-package-duplicate-action"
                  checked={duplicateAction === action}
                  onChange={() => {
                    setDuplicateAction(action);
                    resetPreview();
                  }}
                />
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id={`questionnaire-package-duplicate-action-${action}-tip`}>
                      {duplicateActionTooltip(action)}
                    </Tooltip>
                  }
                >
                  <span style={{ cursor: "help", marginLeft: 6, display: "inline-flex" }}>
                    <img
                      src="/assets/images/info-icon-16.png"
                      width={14}
                      height={14}
                      alt="info"
                      style={{ verticalAlign: "middle" }}
                    />
                  </span>
                </OverlayTrigger>
              </div>
            ))}
          </Form.Group>
        )}

        {preview && (
          <div className="mb-3">
            <div style={{ marginBottom: 12 }}>
              <strong>Preview of data to be imported:</strong>
            </div>

            <div style={{ marginBottom: 12 }}>
              Questionnaires: {preview.summary.questionnaires} | Items: {preview.summary.items} | Question advices:{" "}
              {preview.summary.question_advices} | Creates: {preview.summary.creates} | Updates: {preview.summary.updates} |
              Skips: {preview.summary.skips} | Duplicates: {preview.summary.duplicates} | Errors: {preview.summary.errors}
            </div>

            {preview.errors.length > 0 && (
              <div style={{ marginBottom: 12, color: "#8b5e3c" }}>
                Resolve preview errors before importing.
              </div>
            )}

            <div
              style={{
                overflowX: "auto",
                border: "1px solid #e4e6eb",
                borderRadius: 8,
                maxHeight: 400,
                overflowY: "auto",
                padding: 8,
                backgroundColor: "#ffffff"
              }}
            >
              <PreviewTable
                data={previewTableData}
                columns={previewTableColumns}
                showPagination={true}
                showGlobalFilter={false}
                showColumnFilter={false}
                disableGlobalFilter={true}
              />
            </div>
          </div>
        )}

        {status && <div>{status}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={isImporting}>
          Cancel
        </Button>
        <Button variant="outline-primary" onClick={onPreview} disabled={isImporting || isPreviewing}>
          {isPreviewing ? "Previewing..." : "Preview Import"}
        </Button>
        <Button variant="primary" onClick={onImport} disabled={isImporting || isPreviewing || !preview || preview.summary.errors > 0}>
          Confirm & Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuestionnairePackageImportModal;

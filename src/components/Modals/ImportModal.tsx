// src/components/ImportModal.tsx

import React, { useEffect, useState, memo, useCallback, ChangeEvent, useMemo, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

import useAPI from "../../hooks/useAPI";
import { HttpMethod } from "../../utils/httpMethods";
import PreviewTable from "../Table/Table";
import { ColumnDef } from "@tanstack/react-table";

/* ----------------------------------------
 *  Shared text styles for consistency
 * ---------------------------------------- */
const STANDARD_TEXT: React.CSSProperties = {
  fontFamily: 'verdana, arial, helvetica, sans-serif',
  color: '#333',
  fontSize: '13px',
  lineHeight: '30px',
};

const TABLE_TEXT: React.CSSProperties = {
  fontFamily: 'verdana, arial, helvetica, sans-serif',
  color: '#333',
  fontSize: '15px',
  lineHeight: '1.428em',
};

/* ----------------------------------------
 *  Icon utilities — used for tooltip icons
 * ---------------------------------------- */

/** Helper to resolve asset URLs correctly even under nested routes */
const getBaseUrl = (): string => {
  if (typeof document !== "undefined") {
    const base = document.querySelector("base[href]") as HTMLBaseElement | null;
    if (base?.href) return base.href.replace(/\/$/, "");
  }

  const fromGlobal = (globalThis as any)?.__BASE_URL__;
  if (typeof fromGlobal === "string") return fromGlobal.replace(/\/$/, "");

  const fromProcess =
    (typeof process !== "undefined" && (process as any)?.env?.PUBLIC_URL) || "";

  return String(fromProcess).replace(/\/$/, "");
};

/** Helper for converting relative asset paths to usable URLs */
const assetUrl = (rel: string) => `${getBaseUrl()}/${rel.replace(/^\//, "")}`;

/** Asset map */
const ICONS = {
  info: "assets/images/info-icon-16.png",
} as const;

/** Icon Types */
type IconName = keyof typeof ICONS;

/**
 * Reusable <Icon /> component.
 * Wrapped in React.memo to prevent unnecessary re-renders.
 */
const Icon: React.FC<{
  name: IconName;
  size?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}> = memo(({ name, size = 16, alt, className, style }) => (
  <img
    src={assetUrl(ICONS[name])}
    width={size}
    height={size}
    alt={alt ?? name}
    className={className}
    style={{ verticalAlign: "middle", ...style }}
  />
));
Icon.displayName = "Icon";

/* ----------------------------------------
 *  Props
 * ---------------------------------------- */
type ImportModalProps = {
  show: boolean;       // Parent-controlled visible flag
  onHide: () => void;  // Callback to parent when modal should close
  modelClass: string;  // "User", "Team", etc.
  contextParams?: Record<string, string | number | undefined>;
};

/* ============================================================================
 *  ImportModal Component
 * ============================================================================ */
const ImportModal: React.FC<ImportModalProps> = ({ show, onHide, modelClass, contextParams }) => {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Force-close handler — ALWAYS closes modal instantly.
   * Then notifies parent so it can update state if needed.
   */
  const forceClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setTimeout(onHide, 10);   // Notify parent AFTER close
  }, [onHide]);

  /* ---------------------------------------------------------
   * API metadata state
   * --------------------------------------------------------- */
  const [mandatoryFields, setMandatoryFields] = useState<string[]>([]);
  const [optionalFields, setOptionalFields] = useState<string[]>([]);
  const [externalFields, setExternalFields] = useState<string[]>([]);
  const [duplicateActions, setDuplicateActions] = useState<string[]>([]);

  /* CSV parsing & selection state */
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);  // All CSV rows for preview
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);  // CSV headers

  const [duplicateAction, setDuplicateAction] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [useHeader, setUseHeader] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);  // Show confirmation modal

  /* API hooks */
  const { isLoading, data: importResponse, sendRequest: fetchImports } = useAPI();
  const { error: importError, data: sendImportResponse, sendRequest: sendImport } = useAPI();
  const { data: usersResponse, sendRequest: fetchUsers } = useAPI();

  /* ---------------------------------------------------------
   * Fetch import metadata from backend whenever modal opens
   * --------------------------------------------------------- */

  const fetchConfig = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(contextParams || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const url = params.toString() ? `/import/${modelClass}?${params.toString()}` : `/import/${modelClass}`;
      await fetchImports({ url });
    } catch (err) {
      console.error("Error fetching import config:", err);
    }
  }, [contextParams, fetchImports, modelClass]);

  const sampleCsvHeaders = useMemo(
    () => [...mandatoryFields],
    [mandatoryFields]
  );

  const downloadSampleCsv = useCallback(() => {
    if (sampleCsvHeaders.length === 0) {
      setStatus("No import headers are available yet.");
      return;
    }

    const csvContents = `${sampleCsvHeaders.join(",")}\n`;
    const blob = new Blob([csvContents], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `${modelClass.toLowerCase()}_import_sample.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }, [modelClass, sampleCsvHeaders]);

  useEffect(() => {
    if (show) {
      setStatus('');
      setFile(null);
      setUseHeader(true);
      fetchConfig();
      if (modelClass === "AssignmentParticipant") {
        fetchUsers({ url: "/users" });
      }
    }
  }, [show, fetchConfig, fetchUsers, modelClass]);

  /* ---------------------------------------------------------
   * Transform "column_name" → "Column name"
   * --------------------------------------------------------- */
  const transformField = (field: string) => {
    if (modelClass === "Team" && field.startsWith("participant_")) {
      const index = field.replace("participant_", "");
      return `Participant username ${index}`;
    }

    let f = field.replace(/_/g, " ");
    return f.charAt(0).toUpperCase() + f.slice(1);
  };

  /** Format fields for multiline tooltip display */
  const formatTooltipList = (fields: string[]) => {
    return (
      <div style={{ whiteSpace: 'pre-line' }}>
        {fields.map((f) => transformField(f)).join("\n")}
      </div>
    );
  };

  /* ---------------------------------------------------------
   * Once metadata arrives from backend, populate state
   * --------------------------------------------------------- */
  useEffect(() => {
    if (!importResponse) return;

    const data = importResponse.data;

    setMandatoryFields(data.mandatory_fields);
    setOptionalFields(data.optional_fields);
    setExternalFields(data.external_fields);
    setDuplicateActions(data.available_actions_on_dup);

    setAvailableFields([
      ...data.mandatory_fields,
      ...data.optional_fields,
      ...data.external_fields,
    ]);

    setDuplicateAction(data.available_actions_on_dup[0] ?? "");
  }, [importResponse]);

  /* ---------------------------------------------------------
   * CSV upload handler — extract headers + all content rows
   * --------------------------------------------------------- */
  const on_file_changed = async (incomingFile: File) => {
    setFile(incomingFile);

    if (availableFields.length === 0) return;

    const text = await incomingFile.text();
    const lines = text.split("\n").filter(Boolean);

    if (lines.length > 0) {
      const headers = lines[0].split(",");
      setCsvHeaders(headers);

      setSelectedFields(new Array(headers.length).fill(""));

      // Parse all data rows
      const dataRows = useHeader ? lines.slice(1) : lines;
      const parsedData = dataRows.map(line => line.split(","));
      setCsvData(parsedData);

    }
  };

  /* Update field selection for each dropdown */
  const handleSelectField = (event: ChangeEvent, colIndex: number) => {
    let copy = [...selectedFields];
    // @ts-ignore
    copy[colIndex] = event.target.value;
    setSelectedFields(copy);
  };

  /* ---------------------------------------------------------
   * Submit import to backend
   * --------------------------------------------------------- */
  const on_import = async () => {
    if (!file) {
      setStatus("Please select a CSV file.");
      return;
    }

    // if (!useHeader && !mandatoryFieldsIncluded()) {
    //   setStatus("Please make sure all mandatory fields are selected");
    //   return;
    // }

    // Show confirmation modal before importing
    setShowConfirmation(true);
  };

  /* Confirm and send import to backend */
  const confirmImport = async () => {
    setShowConfirmation(false);
    setStatus("Importing…");

    try {
      const formData = new FormData();
      formData.append("csv_file", file!);
      formData.append("use_headers", String(useHeader));

      if (duplicateAction) {
        formData.append("dup_action", duplicateAction)
      }

      if (!useHeader) {
        formData.append("ordered_fields", JSON.stringify(selectedFields));
      }
      Object.entries(contextParams || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      await sendImport({
        url: `/import/${modelClass}`,
        method: HttpMethod.POST,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

    } catch (err: any) {
      setStatus(err.message || "Unexpected error.");
    }
  };

  useEffect(() => {
    if (sendImportResponse) {
      setStatus(sendImportResponse.data.message);

      if (!importError && !closeTimerRef.current) {
        closeTimerRef.current = setTimeout(() => {
          closeTimerRef.current = null;
          forceClose();
        }, 1500);
      }
    } else if (importError) {
      setStatus(importError);
    }
  }, [forceClose, importError, sendImportResponse]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const previewHeaders = useMemo(
    () => (useHeader ? csvHeaders : selectedFields),
    [csvHeaders, selectedFields, useHeader]
  );

  const previewData = useMemo(() => {
    const rawPreviewData = csvData.map((row) => {
      const obj: Record<string, any> = {};
      previewHeaders.forEach((h, i) => {
        const key = h || `col_${i}`;
        obj[key] = row[i] ?? "";
      });
      return obj;
    });

    if (modelClass !== "AssignmentParticipant") {
      return rawPreviewData;
    }

    // Assignment participant import accepts only usernames. Enrich the preview
    // with read-only user details so instructors can confirm each row resolves
    // to the intended existing user before importing.
    const normalizeField = (field: string) =>
      field
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
    const usersByName = new Map(users.map((user: any) => [String(user.name ?? ""), user]));

    return rawPreviewData.map((row) => {
      const normalizedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [normalizeField(key), value])
      );
      const userName = String(normalizedRow.user_name ?? "").trim();
      const user: any = usersByName.get(userName);

      return {
        user_name: userName,
        full_name: user?.full_name ?? "",
        email: user?.email ?? "",
        role: user?.role?.name ?? "",
        parent: user?.parent?.name ?? "",
        institution: user?.institution?.name ?? "",
        email_on_review: user?.email_on_review ?? "",
        email_on_submission: user?.email_on_submission ?? "",
        email_on_review_of_review: user?.email_on_review_of_review ?? "",
        import_status: user ? "Ready" : "User not found",
      };
    });
  }, [csvData, modelClass, previewHeaders, usersResponse?.data]);

  // Team imports allow creating named teams, but rows without participant
  // values are worth surfacing so instructors can catch accidental blanks.
  const teamRowsWithoutParticipants = useMemo(() => {
    if (modelClass !== "Team") return 0;

    return previewData.filter((row) => {
      const teamName = String(row.name ?? "").trim();
      if (!teamName) return false;

      const participantValues = Object.entries(row)
        .filter(([key]) => key.startsWith("participant_"))
        .map(([, value]) => String(value ?? "").trim())
        .filter(Boolean);

      return participantValues.length === 0;
    }).length;
  }, [modelClass, previewData]);

  const getAvailableOptions = useCallback((colIndex: number) => {
    const selected = new Set(selectedFields.filter((_, idx) => idx !== colIndex));
    return availableFields.filter(field => !selected.has(field));
  }, [selectedFields, availableFields]);

  const previewColumns = useMemo<ColumnDef<any, any>[]>(() => {
    const assignmentParticipantPreviewHeaders = [
      "user_name",
      "full_name",
      "email",
      "role",
      "parent",
      "institution",
      "email_on_review",
      "email_on_submission",
      "email_on_review_of_review",
      "import_status",
    ];
    const headers =
      modelClass === "AssignmentParticipant" ? assignmentParticipantPreviewHeaders : previewHeaders;

    return headers.map((header, idx) => ({
      id: `col_${idx}`,
      header: !useHeader && modelClass !== "AssignmentParticipant" ? (
        <Form.Select
          aria-label="Select Column Header"
          value={selectedFields[idx] || ""}
          onChange={(e) => handleSelectField(e, idx)}
          size="sm"
          style={{
            width: "100%",
            fontSize: "12px",
            padding: "4px 6px",
          }}
        >
          <option value="">-- Select Field --</option>
          {getAvailableOptions(idx).map((field, fieldIdx) => (
            <option key={fieldIdx} value={field}>
              {transformField(field)}
            </option>
          ))}
        </Form.Select>
      ) : (
        transformField(header)
      ),
      accessorKey: header || `col_${idx}`,
      cell: (info: any) => info.getValue() ?? "—",
    }));
  }, [previewHeaders, useHeader, modelClass, selectedFields, getAvailableOptions]);

  /* ============================================================================
   *  Render
   * ============================================================================ */
  return (
    <>
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      keyboard
      backdrop={true}
      contentClassName="border border-2"
    >
      <Modal.Header closeButton style={{ ...STANDARD_TEXT, background: "#f7f8fa" }}>
        <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>
          Import {modelClass}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ ...STANDARD_TEXT }}>
        {isLoading ? (
          <div>Loading…</div>
        ) : (
          <>
            {/* ---------------------------------------------------------
             * FIELD SUMMARY
             * --------------------------------------------------------- */}
            <Row className="mb-3">
              <Col>
                <div style={TABLE_TEXT}>

                  {/* Mandatory fields */}
                  <div className="d-flex align-items-center">
                    <strong>Mandatory fields</strong>
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip id="mandatory-fields-tip">
                          {formatTooltipList(mandatoryFields)}
                        </Tooltip>
                      }
                    >
                      <span style={{ cursor: "help", marginLeft: 6 }}>
                        <Icon name="info" size={16} />
                      </span>
                    </OverlayTrigger>
                  </div>

                  {/* Optional fields */}
                  <div className="d-flex align-items-center">
                    <strong>Optional fields</strong>
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip id="optional-fields-tip">
                          {formatTooltipList(optionalFields)}
                        </Tooltip>
                      }
                    >
                      <span style={{ cursor: "help", marginLeft: 6 }}>
                        <Icon name="info" size={16} />
                      </span>
                    </OverlayTrigger>
                  </div>

                  {/* External fields */}
                  <div className="d-flex align-items-center">
                    <strong>External fields</strong>
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip id="external-fields-tip">
                          {formatTooltipList(externalFields)}
                        </Tooltip>
                      }
                    >
                      <span style={{ cursor: "help", marginLeft: 6 }}>
                        <Icon name="info" size={16} />
                      </span>
                    </OverlayTrigger>
                  </div>

                </div>
              </Col>
            </Row>

            {/* ---------------------------------------------------------
             * FILE INPUT + HEADER SWITCH
             * --------------------------------------------------------- */}
            <Row className="mb-3">
              <Col md={7}>
                <Form.Group controlId="importFile">
                  <Form.Label className="fw-semibold" style={TABLE_TEXT}>
                    CSV file
                  </Form.Label>

                  <Form.Control
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => on_file_changed(e.target.files?.[0] ?? null)}
                  />
                </Form.Group>
              </Col>

              <Col md={5} className="d-flex align-items-end">
                <Form.Check
                  type="switch"
                  id="importHeader"
                  label="First row contains headers"
                  checked={useHeader}
                  onChange={(e) => setUseHeader(e.target.checked)}
                  style={TABLE_TEXT}
                />

                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="import-header-tooltip">
                      In header mode, fields are matched by name.
                    </Tooltip>
                  }
                >
                  <span className="ms-2" style={{ cursor: "help", display: "inline-flex" }}>
                    <Icon name="info" size={16} />
                  </span>
                </OverlayTrigger>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Button
                  variant="outline-primary"
                  onClick={downloadSampleCsv}
                  disabled={sampleCsvHeaders.length === 0}
                >
                  Download Sample CSV
                </Button>
              </Col>
            </Row>



            {/* ---------------------------------------------------------
             * DUPLICATE HANDLING
             * --------------------------------------------------------- */}
            <Row className="mb-3">
              <Col>
                <Form.Label className="fw-semibold" style={TABLE_TEXT}>
                  Duplicate handling
                </Form.Label>

                {duplicateActions.map((action) => {
                  let tooltipText = "";
                  
                  if (action === "SkipRecordAction") {
                    tooltipText = "Skip importing records that already exist in the system.";
                  } else if (action === "UpdateExistingRecordAction") {
                    tooltipText = "Update existing records with new data from the import file.";
                  } else if (action === "ChangeOffendingFieldAction") {
                    tooltipText = "Modify the conflicting field to make the record unique before importing.";
                  }

                  return (
                    <div key={action} className="d-flex align-items-center mb-1">
                      <Form.Check
                        type="radio"
                        name="duplicate_action"
                        style={TABLE_TEXT}
                        checked={duplicateAction === action}
                        onChange={() => setDuplicateAction(action)}
                        label={action}
                      />
                      <OverlayTrigger
                        placement="right"
                        overlay={
                          <Tooltip id={`duplicate-action-${action}-tip`}>
                            {tooltipText}
                          </Tooltip>
                        }
                      >
                        <span style={{ cursor: "help", marginLeft: 6 }}>
                          <Icon name="info" size={14} />
                        </span>
                      </OverlayTrigger>
                    </div>
                  );
                })}
              </Col>
            </Row>

            {/* STATUS SECTION */}
            {status && (
              <Row>
                <Col>
                  <div style={{ marginTop: 8, ...TABLE_TEXT }}>
                    <strong>Status:</strong> {status}
                  </div>
                </Col>
              </Row>
            )}
          </>
        )}
      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer style={{ ...STANDARD_TEXT }}>
        <Button variant="outline-secondary" onClick={forceClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={on_import} disabled={isLoading}>
          Import
        </Button>
      </Modal.Footer>

    </Modal>

    {/* CONFIRMATION MODAL */}
    <Modal
      show={showConfirmation}
      onHide={() => setShowConfirmation(false)}
      centered
      size="xl"
      contentClassName="border border-2"
    >
      <Modal.Header closeButton style={{ ...STANDARD_TEXT, background: "#f7f8fa" }}>
        <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>
          Confirm Import - {modelClass}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ ...STANDARD_TEXT }}>
        <div style={{ marginBottom: 12 }}>
          <strong>Preview of data to be imported:</strong>
        </div>
        {teamRowsWithoutParticipants > 0 && (
          <div style={{ ...TABLE_TEXT, marginBottom: 12, color: "#8b5e3c" }}>
            Note: {teamRowsWithoutParticipants} team{teamRowsWithoutParticipants === 1 ? "" : "s"} will be imported without participants.
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
            backgroundColor: "#ffffff",
          }}
        >
          <PreviewTable
            data={previewData}
            columns={previewColumns}
            showPagination={true}
            showGlobalFilter={false}
            showColumnFilter={false}
            disableGlobalFilter={true}
          />
        </div>

      </Modal.Body>

      <Modal.Footer style={{ ...STANDARD_TEXT }}>
        <Button variant="outline-secondary" onClick={() => setShowConfirmation(false)}>
          Back
        </Button>
        <Button variant="primary" onClick={confirmImport}>
          Confirm & Import
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default ImportModal;

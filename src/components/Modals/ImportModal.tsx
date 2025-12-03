// src/components/ImportModal.tsx

import React, { useEffect, useState, memo, useCallback, ChangeEvent } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Container,
  CloseButton,
} from "react-bootstrap";

import useAPI from "../../hooks/useAPI";
import { HttpMethod } from "../../utils/httpMethods";

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
};

/* ============================================================================
 *  ImportModal Component
 * ============================================================================ */
const ImportModal: React.FC<ImportModalProps> = ({ show, onHide, modelClass }) => {

  /**
   * Force-close handler — ALWAYS closes modal instantly.
   * Then notifies parent so it can update state if needed.
   */
  const forceClose = () => {
    setTimeout(onHide, 10);   // Notify parent AFTER close
  };

  /* ---------------------------------------------------------
   * API metadata state
   * --------------------------------------------------------- */
  const [mandatoryFields, setMandatoryFields] = useState<string[]>([]);
  const [optionalFields, setOptionalFields] = useState<string[]>([]);
  const [externalFields, setExternalFields] = useState<string[]>([]);
  const [duplicateActions, setDuplicateActions] = useState<string[]>([]);

  /* CSV parsing & selection state */
  const [csvFirstLine, setCsvFirstLine] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  const [duplicateAction, setDuplicateAction] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [useHeader, setUseHeader] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");

  /* API hooks */
  const { isLoading, data: importResponse, sendRequest: fetchImports } = useAPI();
  const { data: sendImportResponse, sendRequest: sendImport } = useAPI();

  /* ---------------------------------------------------------
   * Fetch import metadata from backend whenever modal opens
   * --------------------------------------------------------- */

  const fetchConfig = useCallback(async () => {
    try {
      await fetchImports({ url: `/import/${modelClass}` });
    } catch (err) {
      console.error("Error fetching import config:", err);
    }
  }, [fetchImports, modelClass]);

  useEffect(() => {
    if (show) {
      setStatus('');
      setFile(null);
      setUseHeader(true);
      fetchConfig();
    }
  }, [show, fetchConfig]);

  /* ---------------------------------------------------------
   * Transform "column_name" → "Column name"
   * --------------------------------------------------------- */
  const transformField = (field: string) => {
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
   * CSV upload handler — extract headers + first content row
   * --------------------------------------------------------- */
  const on_file_changed = async (incomingFile: File) => {
    setFile(incomingFile);

    if (availableFields.length === 0) return;

    const text = await incomingFile.text();
    const lines = text.split("\n").filter(Boolean);

    if (lines.length > 0) {
      const headers = lines[0].split(",");

      setSelectedFields(new Array(headers.length).fill(availableFields[0]));

      if (lines.length > 1) {
        setCsvFirstLine(lines[1].split(","));
      } else {
        setCsvFirstLine(headers);
      }
    }
  };

  /* Update field selection for each dropdown */
  const handleSelectField = (event: ChangeEvent, colIndex: number) => {
    let copy = [...selectedFields];
    // @ts-ignore
    copy[colIndex] = event.target.value;
    setSelectedFields(copy);
  };

  /* Ensure all selected columns match mandatory fields */
  const mandatoryFieldsIncluded = () =>
    mandatoryFields.every((f) => selectedFields.includes(f));

  /* ---------------------------------------------------------
   * Submit import to backend
   * --------------------------------------------------------- */
  const on_import = async () => {
    if (!file) {
      setStatus("Please select a CSV file.");
      return;
    }

    if (!mandatoryFieldsIncluded()) {
      setStatus("Please make sure all mandatory fields are selected");
      return;
    }

    setStatus("Importing…");

    try {
      const formData = new FormData();
      formData.append("csv_file", file);
      formData.append("use_headers", String(useHeader));

      if (!useHeader) {
        formData.append("ordered_fields", JSON.stringify(selectedFields));
      }

      let url = `/import/${modelClass}`;

      await sendImport({
        url,
        method: HttpMethod.POST,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (sendImportResponse?.data?.message) {
        setStatus(sendImportResponse.data.message);
      } else {
        setStatus("Import complete.");
      }
    } catch (err: any) {
      setStatus(err.message || "Unexpected error.");
    }
  };

  /* ============================================================================
   *  Render
   * ============================================================================ */
  return (
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

            {/* ---------------------------------------------------------
             * COLUMN ORDER (only appears when not using header row)
             * --------------------------------------------------------- */}
            {selectedFields.length > 0 && !useHeader && (
              <Row className="mb-3">
                <Col>

                  <Form.Label className="fw-semibold" style={TABLE_TEXT}>
                    Column order
                  </Form.Label>

                  <div style={{ ...TABLE_TEXT, color: "#666", marginBottom: 6 }}>
                    Select the header for each column. Mandatory fields must be selected.
                  </div>

                  <div
                    style={{
                      border: "1px solid #e4e6eb",
                      borderRadius: 8,
                      padding: 8,
                      maxHeight: 220,
                      overflowY: "auto",
                    }}
                  >
                    {selectedFields.map((field, columnIndex) => (
                      <div
                        key={`${field}_${columnIndex}`}
                        className="d-flex align-items-center justify-content-between mb-1"
                        style={TABLE_TEXT}
                      >
                        <Container fluid>
                          <Row>
                            {/* Dropdown for selecting header */}
                            <Col xs={6}>
                              <Form.Select
                                aria-label="Select Column Header"
                                value={selectedFields[columnIndex]}
                                onChange={(e) => handleSelectField(e, columnIndex)}
                                className="auto-width-select-import"
                                style={{
                                  width: "auto",
                                  minWidth: "max-content",
                                  display: "inline-block",
                                }}
                              >
                                {availableFields.map((field, idx) => (
                                  <option key={idx} value={field}>
                                    {transformField(field)}
                                  </option>
                                ))}
                              </Form.Select>
                            </Col>

                            {/* First row preview text */}
                            <Col xs={6}>
                              {csvFirstLine[columnIndex]
                                ? `First Row Value: ${csvFirstLine[columnIndex]}`
                                : ""}
                            </Col>
                          </Row>
                        </Container>
                      </div>
                    ))}
                  </div>

                </Col>
              </Row>
            )}

            {/* ---------------------------------------------------------
             * DUPLICATE HANDLING
             * --------------------------------------------------------- */}
            <Row className="mb-3">
              <Col>
                <Form.Label className="fw-semibold" style={TABLE_TEXT}>
                  Duplicate handling
                </Form.Label>

                {duplicateActions.map((action) => (
                  <Form.Check
                    key={action}
                    type="radio"
                    name="duplicate_action"
                    className="mb-1"
                    style={TABLE_TEXT}
                    checked={duplicateAction === action}
                    onChange={() => setDuplicateAction(action)}
                    label={action}
                  />
                ))}
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
          cancel
        </Button>
        <Button variant="primary" onClick={on_import} disabled={isLoading}>
          import
        </Button>
      </Modal.Footer>

    </Modal>
  );
};

export default ImportModal;

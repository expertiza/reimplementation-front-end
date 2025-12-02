// src/components/ImportModal.tsx
import React, { useEffect, useState, memo, useCallback, ChangeEvent } from "react";
import { Modal, Button, Form, Row, Col, OverlayTrigger, Tooltip, Container } from "react-bootstrap";
import useAPI from "../../hooks/useAPI";
import {
  IAssignmentFormValues,
  transformAssignmentRequest,
} from "../../pages/Assignments/AssignmentUtil";
import { FormikHelpers } from "formik";
import { alertActions } from "../../store/slices/alertSlice";
import { HttpMethod } from "../../utils/httpMethods";

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

/* Icon utilities */

const getBaseUrl = (): string => {
  if (typeof document !== 'undefined') {
    const base = document.querySelector('base[href]') as HTMLBaseElement | null;
    if (base?.href) return base.href.replace(/\/$/, '');
  }
  const fromGlobal = (globalThis as any)?.__BASE_URL__;
  if (typeof fromGlobal === 'string' && fromGlobal) return fromGlobal.replace(/\/$/, '');
  const fromProcess =
    (typeof process !== 'undefined' && (process as any)?.env?.PUBLIC_URL) || '';
  return String(fromProcess).replace(/\/$/, '');
};

const assetUrl = (rel: string) => `${getBaseUrl()}/${rel.replace(/^\//, '')}`;

const ICONS = {
  info: 'assets/images/info-icon-16.png',
} as const;

type IconName = keyof typeof ICONS;

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
    style={{ verticalAlign: 'middle', ...style }}
  />
));
Icon.displayName = 'Icon';

/* Types */

type ImportMetadataResponse = {
  mandatory_fields: string[];
  optional_fields: string[];
  external_fields: string[];
  available_actions_on_dup: string[];
};

type ImportModalProps = {
  show: boolean;
  onHide: () => void;
  modelClass: string; // <-- "Team", "User", "Assignment", etc.
};

/* Component */

const ImportModal: React.FC<ImportModalProps> = ({ show, onHide, modelClass }) => {
  const [mandatoryFields, setMandatoryFields] = useState<string[]>([]);
  const [optionalFields, setOptionalFields] = useState<string[]>([]);
  const [externalFields, setExternalFields] = useState<string[]>([]);
  const [duplicateActions, setDuplicateActions] = useState<string[]>([]);

  const [csvFirstLine, setCsvFirstLine] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  const [duplicateAction, setDuplicateAction] = useState<string>('');

  const [file, setFile] = useState<File | null>(null);
  const [useHeader, setUseHeader] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('');
  // const [loading, setLoading] = useState<boolean>(false);
  const { error, isLoading, data: importResponse, sendRequest: fetchImports } = useAPI();
  const { data: sendImportResponse, error: importError, sendRequest: sendImport } = useAPI();

  /* Load metadata from backend when modal opens */
  // useEffect(() => {
  //   if (!show) return;
  //
  //   setStatus('');
  //   setFile(null);
  //   setUseHeader(true);

    const fetchConfig = useCallback(async () => {
      try {
        const [importData] = await Promise.all([
          fetchImports({ url: `/import/${modelClass}` })
        ]);

        console.log(importData)
        // Handle the responses as needed
      } catch (err) {
        // Handle any errors that occur during the fetch
        console.error("Error fetching data:", err);
      }
    }, [fetchImports]);

    useEffect(() => {
        fetchConfig();
    }, [show]);

    const transformField = (field: string) => {
        let field_with_spaces = field.replace(/_/g, ' ')
        return field_with_spaces.charAt(0).toUpperCase() + field_with_spaces.slice(1);
    }

  useEffect(() => {
    if (importResponse) {
      const data = importResponse.data
      console.log(data)

      setMandatoryFields(data.mandatory_fields);
      setOptionalFields(data.optional_fields);
      setExternalFields(data.external_fields);
      setDuplicateActions(data.available_actions_on_dup);

      setAvailableFields([
          ...data.mandatory_fields,
          ...data.optional_fields,
          ...data.external_fields
      ]);

      setDuplicateAction(data.available_actions_on_dup[0] ?? '');
    }
  }, [importResponse]);

  /* Field handlers */

  // const toggleField = (field: string) => {
  //   setSelectedFields((prev) =>
  //     prev.includes(field)
  //       ? prev.filter((f) => f !== field)
  //       : [...prev, field],
  //   );
  // };

  // const moveFieldUp = (index: number) => {
  //   if (index <= 0) return;
  //   setSelectedFields((prev) => {
  //     const copy = [...prev];
  //     [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
  //     return copy;
  //   });
  // };

  // const moveFieldDown = (index: number) => {
  //   setSelectedFields((prev) => {
  //     if (index >= prev.length - 1) return prev;
  //     const copy = [...prev];
  //     [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
  //     return copy;
  //   });
  // };

  /* Submit import to backend */

    /**
     * When a file is changed, count the number of columns in the csv and add that amount
     * of dropdowns to the the list.
     * @param incomingFile The csv file to count the columns of.
     */
    const on_file_changed = async (incomingFile: File) => {
        setFile(incomingFile);

        if (availableFields.length > 0){
          var csvFileInText = await incomingFile.text();
          let csv_lines = csvFileInText.split("\n");

          if (csv_lines.length > 0) {
            setSelectedFields([]);
            let csv_headers = csv_lines[0].split(",");
            setSelectedFields(new Array(csv_headers.length).fill(availableFields[0]));

            if (csv_lines.length > 1) {
                setCsvFirstLine(csv_lines[1].split(","));
            }
          }
        }
    }

    const handleSelectField = (event: ChangeEvent, columnIndex: number) => {
        console.log(columnIndex, event.target.value)

        let fields = [...selectedFields];
        fields[columnIndex] = event.target.value;
        setSelectedFields(fields)


        console.log(fields)
    }

    const mandatoryFieldsIncluded = () => {
        return selectedFields.every(field => mandatoryFields.includes(field));
    }

  const on_import = async () => {
    if (!file) {
      setStatus('Please select a CSV file.');
      return;
    }

    if (!mandatoryFieldsIncluded()) {
        setStatus('Please make sure all mandatory fields are selected')
        return
    }

    setStatus('Importing…');

    try {
      const formData = new FormData();
      formData.append('csv_file', file);
      formData.append('use_headers', String(useHeader));

      // If not using header row, send explicit ordered field list
      if (!useHeader) {
        formData.append('ordered_fields', JSON.stringify(selectedFields));
      }

        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }



        let method: HttpMethod = HttpMethod.POST;
      let url: string = `/import/${modelClass}`;

      sendImport({
        url: url,
        method: method,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (sendImportResponse) {
        setStatus(sendImportResponse.data.message);
      } else {
        setStatus('Import complete.');
      }

    } catch (err: any) {
      setStatus(err.message || 'An unexpected error occurred.');
    }
  };


  /* Render */

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop="static"
      keyboard
      contentClassName="border border-2"
    >
      <Modal.Header closeButton style={{ ...STANDARD_TEXT, background: "#f7f8fa" }}>
        <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>Import {modelClass}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ ...STANDARD_TEXT }}>
        {isLoading ? (
          <div>Loading…</div>
        ) : (
          <>
            {/* Field summary */}
            <Row className="mb-3">
              <Col>
                <div style={TABLE_TEXT}>
                  <div>
                    <strong>Mandatory fields:</strong> {mandatoryFields.join(", ") || "—"}
                  </div>
                  <div>
                    <strong>Optional fields:</strong> {optionalFields.join(", ") || "—"}
                  </div>
                  <div>
                    <strong>External fields:</strong> {externalFields.join(", ") || "—"}
                  </div>
                </div>
              </Col>
            </Row>

            {/* File + header row */}
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
                  <span
                    className="ms-2"
                    style={{ cursor: "help", userSelect: "none", display: "inline-flex" }}
                  >
                    <Icon name="info" size={16} />
                  </span>
                </OverlayTrigger>
              </Col>
            </Row>

            {/* Column order */}
            {selectedFields.length > 0 && !useHeader && (
              <Row className="mb-3">
                <Col>
                  <Form.Label className="fw-semibold" style={TABLE_TEXT}>
                    Column order
                  </Form.Label>
                  <div style={{ ...TABLE_TEXT, color: "#666", marginBottom: 6 }}>
                      Select the header for each column. Mandatory fields must be selected, and only selected once.
                  </div>
                  <div
                    style={{
                      border: "1px solid #e4e6eb",
                      borderRadius: 8,
                      padding: 8,
                      maxHeight: 220,
                      overflowY: "auto",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {selectedFields.length === 0 ? (
                      <span style={{ ...TABLE_TEXT, color: "#6b7280" }}>No fields selected.</span>
                    ) : (
                      selectedFields.map((field, columnIndex) => (
                        <div
                          key={`${field}_${columnIndex}`}
                          className="d-flex align-items-center justify-content-between mb-1"
                          style={TABLE_TEXT}
                        >
                            <Container fluid>
                            <Row>
                                <Col xs={6}>
                                    <Form.Select
                                        aria-label="Select Column Header"
                                        defaultValue={availableFields[0]}
                                        value={selectedFields[columnIndex]}
                                        onChange={(e) => handleSelectField(e, columnIndex)}
                                    >
                                        {availableFields.map((field, fieldIndex) => (
                                            <option key={fieldIndex} value={field}>
                                                {transformField(field)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col xs={6}>
                                    { csvFirstLine[columnIndex] ?
                                        (`First Row Value: ${csvFirstLine[columnIndex]}`)
                                    : ('')}
                                </Col>
                            </Row>

                            </Container>
                        </div>
                      ))
                    )}
                  </div>
                </Col>

              </Row>
            )}

            {/* Duplicate handling */}
            <Row className="mb-3">
              <Col>
                <Form.Label className="fw-semibold" style={TABLE_TEXT}>
                  Duplicate handling
                </Form.Label>
                <div>
                  {duplicateActions.length === 0 ? (
                    <div style={TABLE_TEXT}>No duplicate options.</div>
                  ) : (
                    duplicateActions.map((action) => (
                      <Form.Check
                        key={action}
                        type="radio"
                        id={`dup-${action}`}
                        name="duplicate_action"
                        className="mb-1"
                        style={TABLE_TEXT}
                        checked={duplicateAction === action}
                        onChange={() => setDuplicateAction(action)}
                        label={action}
                      />
                    ))
                  )}
                </div>
              </Col>
            </Row>

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

      <Modal.Footer style={{ ...STANDARD_TEXT }}>
        <Button variant="outline-secondary" onClick={onHide}>
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


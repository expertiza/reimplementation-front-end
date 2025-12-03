// src/components/ExportModal.tsx
import React, { useEffect, useState, memo, useCallback } from "react";
import { Modal, Button, Form, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import useAPI from "../../hooks/useAPI";
import { HttpMethod } from "../../utils/httpMethods";

/* =============================================================================
   Shared visual style — same as CreateTeams.tsx
============================================================================= */

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

/* =============================================================================
   Icon utilities — same pattern as Import modal
============================================================================= */

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

/* =============================================================================
   Types
============================================================================= */

// type ExportConfig = {
//   class_name: string;
//   mandatory_fields: string[];
//   optional_fields: string[];
//   default_ordered_fields: string[];
// };

type ExportModal = {
  show: boolean;
  onHide: () => void;
    modelClass: string;
};

/* =============================================================================
   Component (dummy mode – no backend)
============================================================================= */

const ExportModal: React.FC<ExportModal> = ({ show, onHide, modelClass }) => {
    const [mandatoryFields, setMandatoryFields] = useState<string[]>([]);
    const [optionalFields, setOptionalFields] = useState<string[]>([]);
    const [externalFields, setExternalFields] = useState<string[]>([]);
    const [allFields, setAllFields] = useState<string[]>([]);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');
  const { error, isLoading, data: exportResponse, sendRequest: fetchExports } = useAPI();
  const { data: sendExportResponse, error: exportError, sendRequest: sendExport } = useAPI();

    const fetchConfig = useCallback(async () => {
        try {
            fetchExports({ url: `/export/${modelClass}` });
            // Handle the responses as needed
        } catch (err) {
            // Handle any errors that occur during the fetch
            console.error("Error fetching data:", err);
        }
    }, [fetchExports]);

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

  useEffect(() => {
    if (!show) return;

    fetchConfig().then(data => {
        if (exportResponse) {
          setMandatoryFields(exportResponse.data.mandatory_fields);
          setOptionalFields(exportResponse.data.optional_fields);
          setExternalFields(exportResponse.data.external_fields);

          const fields = [
              ...exportResponse.data.mandatory_fields,
              ...exportResponse.data.optional_fields,
              ...exportResponse.data.external_fields
          ]

          setAllFields(fields)
          setSelectedFields(exportResponse.data.mandatory_fields)

          setStatus('');
        }
    })
    // setConfig(dummyConfig);
    // setSelectedFields(dummyConfig.default_ordered_fields);

  }, [show]);

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const moveFieldUp = (index: number) => {
    if (index <= 0) return;
    setAllFields((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const moveFieldDown = (index: number) => {
    setAllFields((prev) => {
      if (index < 0 || index >= prev.length - 1) return prev;
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  function getFormattedDateTimeForFilename() {
    const now = new Date();

    // Get year, month, day
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');

    // Get hours, minutes, seconds
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Combine into a string without invalid characters
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  const downloadFile = (file) => {
    const url = window.URL.createObjectURL(new Blob([file]))
    const link = document.createElement('a')
    link.href = url

    const timestamp = Date.now().toLocaleString();

    link.setAttribute('download', `${modelClass}_export_${getFormattedDateTimeForFilename()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
  const on_export = async () => {
    if (selectedFields.length === 0) {
      setStatus('Please select at least one field.');
      return;
    }

    setStatus('Generating CSV (dummy)…');

    try {
      const formData = new FormData();

      const orderedFields = allFields.filter((f) => selectedFields.includes(f));

      formData.append("ordered_fields", JSON.stringify(orderedFields));

      let url = `/export/${modelClass}`;

      await sendExport({
        url,
        method: HttpMethod.POST,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });


      console.log(sendExportResponse)
      if (sendExportResponse?.data?.message) {
        setStatus(sendExportResponse.data.message);
        downloadFile(sendExportResponse.data.file)
      } else {
        setStatus("Export complete.");
      }
    } catch (err: any) {
      setStatus(err.message || "Unexpected error.");
    }

  };

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
      <Modal.Header closeButton style={{ ...STANDARD_TEXT, background: '#f7f8fa' }}>
        <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>
          Export {modelClass}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ ...STANDARD_TEXT }}>
        {isLoading ? (
          <div>Loading…</div>
        ) : (
          <>
            <Row className="mb-3">
              <Col>
                <div style={TABLE_TEXT}>
                  <div>
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
                  <div>
                    <strong>Optional fields:</strong>
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
                    <div>
                        <strong>Optional fields:</strong>
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

            <Row className="mb-3">
              <Col>
                <Form.Label className="fw-semibold" style={TABLE_TEXT}>
                  Columns to export
                </Form.Label>
                <div style={{ ...TABLE_TEXT, color: '#666', marginBottom: 6 }}>
                  Only checked fields will be included. Use ↑ / ↓ to adjust column order.
                </div>
                <div
                  style={{
                    border: '1px solid #e4e6eb',
                    borderRadius: 8,
                    padding: 8,
                    maxHeight: 220,
                    overflowY: 'auto',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {selectedFields.length === 0 ? (
                    <span style={{ ...TABLE_TEXT, color: '#6b7280' }}>
                      No fields selected.
                    </span>
                  ) : (
                    allFields.map((field, idx) => (
                      <div
                        key={field}
                        className="d-flex align-items-center justify-content-between mb-1"
                        style={TABLE_TEXT}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`export-field-${field}`}
                          checked={selectedFields.includes(field)}
                          onChange={() => toggleField(field)}
                          label={field}
                          disabled={mandatoryFields.includes(field)}
                        />
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => moveFieldUp(idx)}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => moveFieldDown(idx)}
                          >
                            ↓
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Col>
            </Row>

            {status && (
              <Row>
                <Col>
                  <div style={{ marginTop: 8, ...TABLE_TEXT }}>
                    <Icon name="info" size={16} style={{ marginRight: 4 }} />
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
        <Button variant="primary" onClick={on_export} disabled={selectedFields.length == 0}>
          export
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportModal;

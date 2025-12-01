// src/components/ImportModal.tsx
import React, { useEffect, useState, memo } from 'react';
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';

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
  const [duplicateActions, setDuplicateActions] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [duplicateAction, setDuplicateAction] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [useHeader, setUseHeader] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  /* Load metadata from backend when modal opens */
  useEffect(() => {
    if (!show) return;

    setStatus('');
    setFile(null);
    setUseHeader(true);

    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/import/${modelClass}`, { method: 'GET' });
        console.log("testing result modal", res)
        if (!res.ok) throw new Error(`Failed to load import metadata for ${modelClass}`);

        const data: ImportMetadataResponse = await res.json();

        setMandatoryFields(data.mandatory_fields);
        setOptionalFields(data.optional_fields);
        setDuplicateActions(data.available_actions_on_dup);

        const defaultOrdered = [
          ...data.mandatory_fields,
          ...data.optional_fields,
        ];

        setSelectedFields(defaultOrdered);
        setDuplicateAction(data.available_actions_on_dup[0] ?? '');
      } catch (err: any) {
        console.error(err);
        setStatus(err.message || 'Failed to load import configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [show, modelClass]);

  /* Field handlers */

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field],
    );
  };

  const moveFieldUp = (index: number) => {
    if (index <= 0) return;
    setSelectedFields((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const moveFieldDown = (index: number) => {
    setSelectedFields((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  /* Submit import to backend */

  const on_import = async () => {
    if (!file) {
      setStatus('Please select a CSV file.');
      return;
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

      const res = await fetch(`/import/${modelClass}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.error || 'Import failed');
      }

      const body = await res.json();
      setStatus(body.message || 'Import complete.');
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
      <Modal.Header closeButton style={{ ...STANDARD_TEXT, background: '#f7f8fa' }}>
        <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>
          Import {modelClass}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ ...STANDARD_TEXT }}>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <>
            {/* Field summary */}
            <Row className="mb-3">
              <Col>
                <div style={TABLE_TEXT}>
                  <div>
                    <strong>Mandatory fields:</strong>{' '}
                    {mandatoryFields.join(', ') || '—'}
                  </div>
                  <div>
                    <strong>Optional fields:</strong>{' '}
                    {optionalFields.join(', ') || '—'}
                  </div>
                </div>
              </Col>
            </Row>

            {/* Column order */}
            <Row className="mb-3">
              <Col>
                <Form.Label className="fw-semibold" style={TABLE_TEXT}>
                  Column order
                </Form.Label>
                <div style={{ ...TABLE_TEXT, color: '#666', marginBottom: 6 }}>
                  Use the checkboxes to include/exclude fields, and ↑ / ↓ to change order.
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
                    selectedFields.map((field, idx) => (
                      <div
                        key={field}
                        className="d-flex align-items-center justify-content-between mb-1"
                        style={TABLE_TEXT}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`import-field-${field}`}
                          checked={selectedFields.includes(field)}
                          onChange={() => toggleField(field)}
                          label={field}
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
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
                    style={{ cursor: 'help', userSelect: 'none', display: 'inline-flex' }}
                  >
                    <Icon name="info" size={16} />
                  </span>
                </OverlayTrigger>
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
        <Button variant="primary" onClick={on_import} disabled={loading}>
          import
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportModal;


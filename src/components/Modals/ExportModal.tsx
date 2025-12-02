// src/components/ExportTeamsDummyModal.tsx
import React, { useEffect, useState, memo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

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

type ExportConfig = {
  class_name: string;
  mandatory_fields: string[];
  optional_fields: string[];
  default_ordered_fields: string[];
};

type ExportTeamsDummyModalProps = {
  show: boolean;
  onHide: () => void;
};

/* =============================================================================
   Component (dummy mode – no backend)
============================================================================= */

const ExportTeamsDummyModal: React.FC<ExportTeamsDummyModalProps> = ({ show, onHide }) => {
  const [config, setConfig] = useState<ExportConfig | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!show) return;

    const dummyConfig: ExportConfig = {
      class_name: 'Team',
      mandatory_fields: ['team_name'],
      optional_fields: ['mentor', 'member_username'],
      default_ordered_fields: ['team_name', 'mentor', 'member_username'],
    };

    setConfig(dummyConfig);
    setSelectedFields(dummyConfig.default_ordered_fields);
    setStatus('');
  }, [show]);

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
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
      if (index < 0 || index >= prev.length - 1) return prev;
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  const on_export = () => {
    if (!config) return;
    if (selectedFields.length === 0) {
      setStatus('Please select at least one field.');
      return;
    }

    setStatus('Generating CSV (dummy)…');

    // Dummy rows for demo only
    const dummyRows = [
      {
        team_name: 'sshivas MentoredTeam',
        mentor: 'Teaching Assistant 10816',
        member_username: 'Student 10917',
      },
      {
        team_name: 'IronMan2 MentoredTeam',
        mentor: 'Teaching Assistant 10234',
        member_username: 'Student 10931',
      },
    ];

    const header = selectedFields.join(',');
    const body = dummyRows
      .map((row) => selectedFields.map((f) => (row as any)[f] ?? '').join(','))
      .join('\n');

    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teams-dummy-export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setStatus('Export complete (dummy CSV downloaded).');
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
          Export teams (dummy)
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ ...STANDARD_TEXT }}>
        {!config ? (
          <div>Loading…</div>
        ) : (
          <>
            <Row className="mb-3">
              <Col>
                <div style={TABLE_TEXT}>
                  <div>
                    <strong>Mandatory fields:</strong>{' '}
                    {config.mandatory_fields.join(', ') || '—'}
                  </div>
                  <div>
                    <strong>Optional fields:</strong>{' '}
                    {config.optional_fields.join(', ') || '—'}
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
                    selectedFields.map((field, idx) => (
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
        <Button variant="primary" onClick={on_export} disabled={!config}>
          export
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportTeamsDummyModal;

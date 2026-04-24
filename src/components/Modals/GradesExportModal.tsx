import React, { memo, useEffect, useState } from "react";
import { Button, Col, Form, Modal, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import axiosClient from "../../utils/axios_client";

const STANDARD_TEXT: React.CSSProperties = {
  fontFamily: "verdana, arial, helvetica, sans-serif",
  color: "#333",
  fontSize: "13px",
  lineHeight: "30px",
};

const TABLE_TEXT: React.CSSProperties = {
  fontFamily: "verdana, arial, helvetica, sans-serif",
  color: "#333",
  fontSize: "15px",
  lineHeight: "1.428em",
};

const getBaseUrl = (): string => {
  if (typeof document !== "undefined") {
    const base = document.querySelector("base[href]") as HTMLBaseElement | null;
    if (base?.href) return base.href.replace(/\/$/, "");
  }
  const fromGlobal = (globalThis as any)?.__BASE_URL__;
  if (typeof fromGlobal === "string" && fromGlobal) return fromGlobal.replace(/\/$/, "");
  const fromProcess =
    (typeof process !== "undefined" && (process as any)?.env?.PUBLIC_URL) || "";
  return String(fromProcess).replace(/\/$/, "");
};

const assetUrl = (rel: string) => `${getBaseUrl()}/${rel.replace(/^\//, "")}`;

const Icon: React.FC<{ size?: number; style?: React.CSSProperties }> = memo(
  ({ size = 16, style }) => (
    <img
      src={assetUrl("assets/images/info-icon-16.png")}
      width={size}
      height={size}
      alt="info"
      style={{ verticalAlign: "middle", ...style }}
    />
  )
);
Icon.displayName = "Icon";

type GradesExportModalProps = {
  assignmentId?: number | string;
  assignmentName?: string;
  show: boolean;
  onHide: () => void;
};

const mandatoryFields = ["username", "grade", "comment"];
const optionalFields = ["email"];

const transformField = (field: string) => {
  const label = field.replace(/_/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const getTimestampForFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

const filenameSafe = (value: string | undefined) =>
  (value || "assignment")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "assignment";

const GradesExportModal: React.FC<GradesExportModalProps> = ({
  assignmentId,
  assignmentName,
  show,
  onHide,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState("");
  const [includeEmail, setIncludeEmail] = useState(false);

  useEffect(() => {
    if (!show) return;

    setStatus("");
    setIncludeEmail(false);
  }, [show]);

  const formatTooltipList = (fields: string[]) => (
    <div style={{ whiteSpace: "pre-line" }}>
      {fields.map((field) => transformField(field)).join("\n")}
    </div>
  );

  const downloadGrades = async () => {
    if (!assignmentId) {
      setStatus("Missing assignment.");
      return;
    }

    setIsExporting(true);
    setStatus("Generating CSV...");

    try {
      const params = includeEmail ? { include_email: true } : undefined;
      const response = await axiosClient.get(`/grades/${assignmentId}/export`, {
        params,
        responseType: "blob",
        headers: { Accept: "text/csv" },
      });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `${filenameSafe(assignmentName)}-grades_${getTimestampForFilename()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatus("Grades have been exported!");
      setTimeout(() => {
        setStatus("");
        onHide();
      }, 1200);
    } catch (err: any) {
      setStatus(err?.response?.data?.error || err?.message || "Failed to export grades.");
    } finally {
      setIsExporting(false);
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
      <Modal.Header closeButton style={{ ...STANDARD_TEXT, background: "#f7f8fa" }}>
        <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>
          Export Grades
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={STANDARD_TEXT}>
        <Row className="mb-3">
          <Col>
            <div style={TABLE_TEXT}>
              <strong>Mandatory fields</strong>
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="grades-export-mandatory-fields-tip">
                    {formatTooltipList(mandatoryFields)}
                  </Tooltip>
                }
              >
                <span style={{ cursor: "help", marginLeft: 6 }}>
                  <Icon size={16} />
                </span>
              </OverlayTrigger>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <div style={TABLE_TEXT}>
              <strong>Optional fields:</strong>
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="grades-export-optional-fields-tip">
                    {formatTooltipList(optionalFields)}
                  </Tooltip>
                }
              >
                <span style={{ cursor: "help", marginLeft: 6 }}>
                  <Icon size={16} />
                </span>
              </OverlayTrigger>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label className="fw-semibold" style={TABLE_TEXT}>
              Columns to export
            </Form.Label>
            <div
              style={{
                border: "1px solid #e4e6eb",
                borderRadius: 8,
                padding: 8,
                backgroundColor: "#ffffff",
              }}
            >
              {mandatoryFields.map((field) => (
                <div key={field} className="mb-1" style={TABLE_TEXT}>
                  <Form.Check
                    type="checkbox"
                    id={`grades-export-field-${field}`}
                    checked
                    disabled
                    label={field}
                    readOnly
                  />
                </div>
              ))}
              {optionalFields.map((field) => (
                <div key={field} className="mb-1" style={TABLE_TEXT}>
                  <Form.Check
                    type="checkbox"
                    id={`grades-export-field-${field}`}
                    checked={field === "email" ? includeEmail : false}
                    label={field}
                    onChange={(event) => setIncludeEmail(event.currentTarget.checked)}
                  />
                </div>
              ))}
            </div>
          </Col>
        </Row>

        {status && (
          <Row>
            <Col>
              <div style={{ marginTop: 8, ...TABLE_TEXT }}>
                <Icon size={16} style={{ marginRight: 4 }} />
                <strong>Status:</strong> {status}
              </div>
            </Col>
          </Row>
        )}
      </Modal.Body>

      <Modal.Footer style={STANDARD_TEXT}>
        <Button variant="outline-secondary" onClick={onHide} disabled={isExporting}>
          cancel
        </Button>
        <Button variant="primary" onClick={downloadGrades} disabled={isExporting}>
          {isExporting ? "exporting" : "export"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GradesExportModal;

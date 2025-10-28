import React from "react";
import { Button, Card, Form } from "react-bootstrap";

interface ParticipantToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCopyFromCourse: () => void;
  onCopyToCourse: () => void;
  onImportClick: () => void;
  onExport: () => void;
  onBack: () => void;
  importInputRef: React.RefObject<HTMLInputElement>;
  onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ParticipantToolbar: React.FC<ParticipantToolbarProps> = ({
  searchValue,
  onSearchChange,
  onCopyFromCourse,
  onCopyToCourse,
  onImportClick,
  onExport,
  onBack,
  importInputRef,
  onImportFileChange,
}) => {
  return (
    <Card
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        backgroundColor: "#ffffff",
      }}
    >
      <Card.Body style={{ padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.625rem",
              alignItems: "center",
              flex: "1 1 auto",
            }}
          >
            <div
              style={{
                position: "relative",
                minWidth: "300px",
                maxWidth: "450px",
                flex: "1 1 auto",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img src="/assets/images/paste.png" alt="Search" width={14} height={14} />
              </div>
              <Form.Control
                type="text"
                placeholder="Search participants..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  fontSize: "0.8125rem",
                  padding: "0.5rem 1rem",
                  paddingLeft: "2.5rem",
                  fontWeight: 600,
                  borderRadius: "0.5rem",
                  border: "1px solid #cbd5e0",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  height: "35px",
                  marginBottom: 0,
                }}
              />
            </div>
            <Button
              className="btn btn-md"
              variant="primary"
              onClick={onCopyFromCourse}
              style={{
                fontSize: "0.8125rem",
                padding: "0.5rem 1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <img src="/assets/images/Copy-icon-24.png" alt="Copy" width={14} height={14} />
              Copy from course
            </Button>
            <Button
              className="btn btn-md"
              variant="primary"
              onClick={onCopyToCourse}
              style={{
                fontSize: "0.8125rem",
                padding: "0.5rem 1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <img src="/assets/images/Copy-icon-24.png" alt="Copy" width={14} height={14} />
              Copy to course
            </Button>
            <Button
              className="btn btn-md"
              variant="outline-secondary"
              onClick={onImportClick}
              style={{
                fontSize: "0.8125rem",
                padding: "0.5rem 1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                borderRadius: "0.5rem",
              }}
            >
              <img src="/assets/icons/assign-survey-24.png" alt="Import" width={14} height={14} />
              Import CSV
            </Button>
            <Button
              className="btn btn-md"
              variant="outline-secondary"
              onClick={onExport}
              style={{
                fontSize: "0.8125rem",
                padding: "0.5rem 1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                borderRadius: "0.5rem",
              }}
            >
              <img src="/assets/icons/export-temp.png" alt="Export" width={14} height={14} />
              Export CSV
            </Button>
          </div>
          <Button
            className="btn btn-md"
            variant="outline-secondary"
            onClick={onBack}
            style={{
              fontSize: "0.8125rem",
              padding: "0.5rem 1rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "0.5rem",
            }}
          >
            Back
          </Button>
        </div>
        <input
          type="file"
          accept=".csv,text/csv"
          ref={importInputRef}
          onChange={onImportFileChange}
          style={{ display: "none" }}
        />
      </Card.Body>
    </Card>
  );
};

export default ParticipantToolbar;

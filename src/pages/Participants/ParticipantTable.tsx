import React from "react";
import { Badge, Button, Card, Form, Table as BTable } from "react-bootstrap";
import { Participant, ALL_ROLES } from "./participantTypes";
import { prettyName } from "./participantHelpers";

interface ParticipantTableProps {
  participants: Participant[];
  isLoading: boolean;
  requireQuiz: boolean;
  onRoleChange: (id: number, newRoleId: number) => void;
  onRemoveClick: (participant: Participant) => void;
}

const ParticipantTable: React.FC<ParticipantTableProps> = ({
  participants,
  isLoading,
  requireQuiz,
  onRoleChange,
  onRemoveClick,
}) => {
  if (isLoading) {
    return (
      <Card
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#718096" }}>Loading participants...</p>
        </div>
      </Card>
    );
  }

  if (participants.length === 0) {
    return (
      <Card
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#718096" }}>No participants found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      <div className="table-responsive">
        <BTable
          hover
          style={{
            marginBottom: 0,
            fontSize: "0.875rem",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f9fafb",
              borderBottom: "2px solid #e5e7eb",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <tr>
              <th
                style={{
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "1rem",
                  borderBottom: "2px solid #e5e7eb",
                  verticalAlign: "middle",
                  width: "80px",
                }}
              >
                Parent
              </th>
              <th
                style={{
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "1rem",
                  borderBottom: "2px solid #e5e7eb",
                  verticalAlign: "middle",
                }}
              >
                Username
              </th>
              <th
                style={{
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "1rem",
                  borderBottom: "2px solid #e5e7eb",
                  verticalAlign: "middle",
                }}
              >
                Name
              </th>
              <th
                style={{
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "1rem",
                  borderBottom: "2px solid #e5e7eb",
                  verticalAlign: "middle",
                }}
              >
                Email
              </th>
              <th
                style={{
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "1rem",
                  borderBottom: "2px solid #e5e7eb",
                  verticalAlign: "middle",
                }}
              >
                Actions
              </th>
              <th
                style={{
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "1rem",
                  borderBottom: "2px solid #e5e7eb",
                  verticalAlign: "middle",
                }}
              >
                Participant Role
              </th>
              <th
                style={{
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "1rem",
                  borderBottom: "2px solid #e5e7eb",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, index) => (
              <tr
                key={p.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  transition: "background-color 0.15s ease",
                }}
              >
                <td style={{ padding: "1rem", verticalAlign: "middle", width: "80px" }}>
                  <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                    {p.parent?.name || "—"}
                  </span>
                </td>
                <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#111827",
                      fontSize: "0.875rem",
                    }}
                  >
                    {p.name}
                  </div>
                </td>
                <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                  <div>
                    <div
                      style={{
                        color: "#111827",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {prettyName(p.full_name ?? "")}
                    </div>
                    {p.handle && (
                      <div
                        style={{
                          color: "#a0aec0",
                          fontSize: "0.75rem",
                          marginTop: "0.15rem",
                        }}
                      >
                        @{p.handle}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                  <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>{p.email ?? ""}</span>
                </td>
                <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "nowrap",
                      alignItems: "center",
                    }}
                  >
                    <Badge
                      bg="success"
                      style={{
                        fontSize: "0.6875rem",
                        padding: "0.375rem 0.75rem",
                        fontWeight: 600,
                        borderRadius: "9999px",
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Submit
                    </Badge>
                    <Badge
                      bg="info"
                      style={{
                        fontSize: "0.6875rem",
                        padding: "0.375rem 0.75rem",
                        fontWeight: 600,
                        borderRadius: "9999px",
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Review
                    </Badge>
                    {requireQuiz && (
                      <Badge
                        bg="warning"
                        style={{
                          fontSize: "0.6875rem",
                          padding: "0.375rem 0.75rem",
                          fontWeight: 600,
                          borderRadius: "9999px",
                          textTransform: "capitalize",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Quiz
                      </Badge>
                    )}
                  </div>
                </td>
                <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                  <Form.Select
                    size="sm"
                    aria-label="Participant Role"
                    value={p.role?.id}
                    onChange={(e) => onRoleChange(p.id, parseInt(e.target.value, 10))}
                    style={{
                      fontSize: "0.8125rem",
                      padding: "0.5rem 0.75rem",
                      cursor: "pointer",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontWeight: 500,
                      color: "#374151",
                      maxWidth: "110px",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Form.Select>
                </td>
                <td
                  style={{
                    padding: "1rem",
                    verticalAlign: "middle",
                    textAlign: "center",
                  }}
                >
                  <Button
                    variant="outline-danger"
                    size="sm"
                    title="Remove participant"
                    onClick={() => onRemoveClick(p)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.875rem",
                      borderRadius: "0.5rem",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #fecaca",
                      color: "#ef4444",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fef2f2";
                      e.currentTarget.style.borderColor = "#fca5a5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "#fecaca";
                    }}
                  >
                    <img src={"/assets/images/delete-icon-24.png"} alt="Delete" width={14} height={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </BTable>
      </div>
    </Card>
  );
};

export default ParticipantTable;

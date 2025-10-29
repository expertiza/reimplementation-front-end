import React, { useMemo, useState } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { calculateAverages, getColorClass } from "../ViewTeamGrades/utils";
import "./assignments.scss";

// ----------- types -----------
type Reviewer = { id: number; name: string };
type RubricRow = { questionNo: number; scores: Record<number, number> };
type LinkItem = { name: string; url: string };

type LoaderData = {
  assignment: { id: number; name: string };
  team: { id: number; name: string };
  reviewers: Reviewer[];
  rubric: RubricRow[];
  links: LinkItem[];
  existing?: { grade?: number; comment?: string };
};

// ---------- mock loader data for now ----------
const USE_MOCK = true;
function makeMock(assignmentId: number, teamId: number): LoaderData {
  const reviewers: Reviewer[] = [
    { id: 201, name: "Srinidhi Shivakumarasa" },
    { id: 202, name: "Aryel" },
  ];
  // Include each base score 0..5 but with random decimals.
  const clamp = (x: number, lo = 0, hi = 5) => Math.max(lo, Math.min(hi, x));
  const jitter = (base: number) => {
    const r = Math.random(); // [0, 1)
    if (base === 0) return clamp(base + r);
    if (base === 5) return clamp(base - r);
    const sign = Math.random() < 0.5 ? -1 : 1;
    return clamp(base + sign * r);           // wiggle within [0,5]
  };
  const cycle = [0, 1, 2, 3, 4, 5];
  const rubric: RubricRow[] = Array.from({ length: 12 }, (_, i) => {
    const v = cycle[i % cycle.length];
    const s1 = jitter(v);
    const s2 = jitter(5 - v);
    return {
      questionNo: i + 1,
      scores: { 201: s1, 202: s2 },
    };
  });
  return {
    assignment: { id: assignmentId, name: "Program 1" },
    team: { id: teamId, name: "Ash, Srinidhi Team" },
    reviewers,
    rubric,
    links: [
      { name: "Submission ZIP", url: "https://example.com/submission.zip" },
      { name: "GitHub repo", url: "https://github.com/example/repo" },
    ],
    existing: {},
  };
}

export async function assignGradesLoader({ params, request }: any): Promise<LoaderData> {
  const url = new URL(request.url);
  const teamId = Number(url.searchParams.get("team_id") || 0);
  const assignmentId = Number(params.assignmentId || 0);
  if (USE_MOCK) return makeMock(assignmentId, teamId);

  const res = await fetch(`/api/v1/assignments/${assignmentId}/teams/${teamId}/summary`);
  if (!res.ok) throw new Error("Failed to load");
  return (await res.json()) as LoaderData;
}

// ---------- helpers ----------
type RowSort = "none" | "asc" | "desc";

const AssignGrades: React.FC = () => {
  const data = useLoaderData() as LoaderData;
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const [showSubmission, setShowSubmission] = useState(false);
  const [grade, setGrade] = useState<string>((data.existing?.grade ?? "").toString());
  const [comment, setComment] = useState<string>(data.existing?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mirror ReviewTable behavior: optional "Question" column + sort by Avg
  const [showToggleQuestion, setShowToggleQuestion] = useState(false);
  const [sortOrderRow, setSortOrderRow] = useState<RowSort>("none");
  // dummy UI state for the two checkboxes
  const [gt10Words, setGt10Words] = useState(false);
  const [gt20Words, setGt20Words] = useState(false);
  const toggleSortOrderRow = () => {
    setSortOrderRow(prev =>
      prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc"
    );
  };

  // Use the same data shape & helpers as ReviewTable
  const MAX_PER_REVIEW = 5;
  const currentRoundData = useMemo(() => {
    if (!Array.isArray(data.rubric) || !Array.isArray(data.reviewers)) return [];
    return data.rubric.map((r) => ({
      questionNo: r.questionNo,
      maxScore: MAX_PER_REVIEW,
      reviews: data.reviewers.map((rv) => ({ score: Number(r.scores[rv.id] ?? 0) })),
    }));
  }, [data.rubric, data.reviewers]);

  const { averagePeerReviewScore, columnAverages, sortedData } = useMemo(() => {
    const clone = currentRoundData.map(row => ({ ...row, reviews: row.reviews.map(x => ({ ...x })) }));
    return calculateAverages(clone as any, sortOrderRow);
  }, [currentRoundData, sortOrderRow]);

  return (
    <Container fluid className="mt-3 assignments-scope" style={{ fontFamily: "verdana,arial,helvetica,sans-serif", color: "#333" }}>
      <Row className="mb-2">
        <Col className="text-start">
          <h2 className="assignments-heading">Summary Report for assignment: {data.assignment.name}</h2>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col>
          <div>Team: {data.team.name}</div>
          <div>There are no reviews for this assignment</div>
          <Button
            variant="outline-secondary"
            className="btn btn-md mt-2"
            onClick={() => setShowSubmission(s => !s)}
          >
            {showSubmission ? "Hide Submission" : "Show Submission"}
          </Button>
        </Col>
      </Row>

      {showSubmission && (
        <Row className="mb-3">
          <Col md={8}>
            <ul className="mb-0">
              {data.links.map((l, i) => (
                <li key={i}>
                  <a href={l.url} target="_blank" rel="noreferrer">{l.name}</a>
                </li>
              ))}
            </ul>
          </Col>
        </Row>
      )}

      {savedMsg && (
        <Alert className="flash_note alert alert-success" dismissible onClose={() => setSavedMsg(null)}>
          {savedMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert className="flash_note alert alert-danger" dismissible onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      <Row className="mb-2 g-0">
        <Col xs="auto" className="ps-0">
          {/* Heading + inline legend/toggles to match screenshot */}
          <div className="table-container mb-1 ms-0">
            <h4 className="text-xl font-semibold d-inline-block me-3 mb-0">Teammate Review</h4>
            <span className="legend-links">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setShowToggleQuestion(v => !v); }}
              >
                toggle question list
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>color legend</a>
              <a href="#" onClick={(e) => e.preventDefault()}>interaction legend</a>
            </span>
          </div>
          <div className="word-comments mb-2">
            <label className="me-3">
              <input
                type="checkbox"
                checked={gt10Words}
                onChange={() => setGt10Words(v => !v)}
              />{" "}
              &gt; 10 Word Comments
            </label>
            <label>
              <input
                type="checkbox"
                checked={gt20Words}
                onChange={() => setGt20Words(v => !v)}
              />{" "}
              &gt; 20 Word Comments
            </label>
          </div>

          {/* Recreated table with the same structure/CSS as ReviewTable */}
          <div className="table-container mb-6 ms-0">
            <h4 className="text-xl font-semibold">Teammate Review</h4>
            <table className="tbl_heat">
              <thead>
                {/* white header row (no gray background) */}
                <tr>
                  <th className="py-2 px-4 text-center" style={{ whiteSpace: "nowrap" }}>
                    Question
                  </th>
                  {showToggleQuestion && (
                    <th className="py-2 px-4 text-center" style={{ whiteSpace: "nowrap" }}>
                      Question
                    </th>
                  )}
                  {data.reviewers.map((r) => (
                    <th
                      key={r.id}
                      className="py-2 px-4 text-center reviewer-th"
                      title={r.name}
                      style={{
                        whiteSpace: "nowrap", // keep header on one line
                      }}
                    >
                      {r.name}
                    </th>
                  ))}
                  <th
                    className="py-2 px-4 avg-th"
                    style={{
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={toggleSortOrderRow}
                    title="Sort by Average"
                  >
                    Avg{" "}
                    {sortOrderRow === "none" ? <span>▲▼</span> : sortOrderRow === "asc" ? <span> ▲</span> : <span> ▼</span>}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row: any) => (
                  <tr key={row.questionNo}>
                    <td className="py-2 px-4 text-center" style={{  whiteSpace: "nowrap" }}>
                      {row.questionNo}
                    </td>
                    {showToggleQuestion && (
                      <td className="py-2 px-4 text-left" style={{  }}>
                        {/* No question text in our loader shape; leave blank / plug in if available */}
                      </td>
                    )}
                    {row.reviews.map((rv: any, i: number) => (
                      <td
                        key={i}
                        className={`py-2 px-4 text-center ${getColorClass(Number(rv.score ?? 0), row.maxScore)}`}
                      >
                        {Number(rv.score ?? 0).toFixed(2)}
                      </td>
                    ))}
                    <td className="py-2 px-4 text-center no-heat">
                      {Number(row.RowAvg ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="no-bg">
                  <td className="py-2 px-4" style={{ whiteSpace: "nowrap" }}>
                    Avg
                  </td>
                  {showToggleQuestion && <td></td>}
                  {columnAverages.map((avg: number, index: number) => (
                    <td key={index} className="py-2 px-4 text-center">
                      {avg.toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="mt-2">
              <Button
                variant="outline-secondary"
                className="btn btn-md"
                onClick={() => setSortOrderRow("desc")}
                title="Sort by total review score"
              >
                Sort by total review score
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Grade & Comments */}
      <Row className="mb-5 grade-section">
        <Col md={8} className="grade-no-panel">
            <h3 className="plain-form-title">Grade and comment for submission</h3>
            <form
              className="plain-grade-form"
              onSubmit={(e) => {
              e.preventDefault();
              const g = grade === "" ? NaN : Number(grade);
              if (Number.isNaN(g) || g < 0 || g > 100) {
                setErrorMsg("Grade must be a number between 0 and 100.");
                return;
              }
              setSaving(true);
              (async () => {
                try {
                  if (USE_MOCK) await new Promise(r => setTimeout(r, 350));
                  setSavedMsg("Saved!");
                } catch (err: any) {
                  setErrorMsg(err?.message || "Failed to save");
                } finally {
                  setSaving(false);
                }
              })();
            }}>
              <div className="mb-3">
                <label className="form-label">Grade</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Grade"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Comments</label>
                <textarea
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comment"
                />
              </div>
              <div className="actions-vertical">
                <Button
                  type="submit"
                  variant="outline-secondary"
                  className="btn btn-md"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
                <a
                  href="#"
                  className="back-link"
                  onClick={(e) => { e.preventDefault(); navigate(-1); }}
                >
                  Back
                </a>
              </div>
            </form>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignGrades;

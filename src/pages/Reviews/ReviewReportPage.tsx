import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Spinner,
  Button,
  Form,
  InputGroup,
  Alert,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { createColumnHelper } from "@tanstack/react-table";
import { BsCaretDownFill, BsCaretUpFill } from "react-icons/bs";
import Table from "../../components/Table/Table";
import axiosClient from "../../utils/axios_client";
import "./Reviews.css";

function SortableHeader({ label, column, isSortable = true }: { label: string; column: { getCanSort: () => boolean; getIsSorted: () => false | "asc" | "desc" }; isSortable?: boolean }) {
  const canSort = isSortable; // Show icons if explicitly marked as sortable
  return (
    <span className="review-report-th">
      {label}
      {canSort && (
        <span className="ms-1 review-report-sort-icon" style={{ verticalAlign: "middle" }}>
          {column.getIsSorted() === "asc" && <BsCaretUpFill />}
          {column.getIsSorted() === "desc" && <BsCaretDownFill />}
          {!column.getIsSorted() && (
            <span className="review-report-sort-unsorted">
              <BsCaretUpFill style={{ opacity: 0.6 }} />
              <BsCaretDownFill style={{ opacity: 0.6 }} />
            </span>
          )}
        </span>
      )}
    </span>
  );
}

const columnHelper = createColumnHelper<ReviewData>();

function getTeamStatusText(status: ReviewData["teamReviewedStatus"]): string {
  return status === "red"
    ? "Not Completed"
    : status === "blue"
      ? "Completed, No Grade"
      : status === "green"
        ? "No Submitted Work"
        : status === "purple"
          ? "No Review"
          : "Grade Assigned";
}

// --------------------------------------------------------------------------
// --- INTERFACES & UTILITIES ---
// --------------------------------------------------------------------------

interface ReviewRound {
  round: number;
  calculatedScore: number | null;
  maxScore: number | null;
  reviewVolume: number;
  reviewCommentCount: number;
}

interface ReviewData {
  id: number;
  reviewerName: string;
  reviewerUsername: string;
  reviewerId: number;
  reviewsCompleted: number;
  reviewsSelected: number;
  teamReviewedName: string;
  teamReviewedStatus: "red" | "blue" | "green" | "purple" | "brown";
  hasConsent: boolean;
  calculatedScore: number | null;
  maxScore: number | null;
  rounds: ReviewRound[];
  reviewComment: string | null;
  reviewVolume: number;
  reviewCommentCount: number;
  assignedGrade: number | null;
  instructorComment: string | null;
}

// --------------------------------------------------------------------------
// --- METRICS CHART COMPONENT (Uses Recharts) ---
// --------------------------------------------------------------------------

interface MetricsChartProps {
  reviewVolume: number;
  reviewCommentCount: number;
  averageVolume: number;
}

const MetricsChart: React.FC<MetricsChartProps> = ({
  reviewVolume,
  reviewCommentCount,
  averageVolume,
}) => {
  const data = [
    { name: "Your Review", value: reviewVolume, color: "#8884d8" },
    { name: "Assignment Avg", value: averageVolume, color: "#82ca9d" },
  ];

  return (
    <div style={{ width: "100%", height: 120 }}>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 0, left: 5, bottom: 5 }}
        >
          <YAxis dataKey="name" type="category" stroke="#343a40" fontSize={10} />
          <XAxis
            type="number"
            hide={true}
            domain={[0, Math.max(reviewVolume, averageVolume) * 1.2]}
          />
          <Tooltip
            formatter={(value: number) => [`${value} unique words`, "Volume"]}
          />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <small style={{ display: "block", textAlign: "center", fontSize: "0.75rem" }}>
        {reviewVolume} words ({averageVolume.toFixed(1)} Avg.)
      </small>
      <small style={{ display: "block", textAlign: "center", fontSize: "0.75rem" }}>
        {reviewCommentCount} comments
      </small>
    </div>
  );
};

// --------------------------------------------------------------------------
// --- GRADE/COMMENT CELL ---
// --------------------------------------------------------------------------

const GradeCommentCell: React.FC<{
  review: ReviewData;
  onSave: (id: number, grade: number | null, comment: string) => void;
}> = ({ review, onSave }) => {
  const [grade, setGrade] = useState<number | string>(review.assignedGrade ?? "");
  const [comment, setComment] = useState<string>(review.instructorComment ?? "");

  const handleSave = () => {
    onSave(review.id, grade === "" ? null : Number(grade), comment);
  };

  return (
    <>
      <InputGroup className="mb-2">
        <Form.Control
          type="number"
          placeholder="Grade"
          style={{ width: "80px", display: "inline-block" }}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <InputGroup.Text> / 100</InputGroup.Text>
      </InputGroup>
      <Form.Control
        as="textarea"
        rows={2}
        placeholder="Instructor Comments"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button className="btn btn-md mt-1" variant="outline-secondary" onClick={handleSave}>
        Save
      </Button>
    </>
  );
};

// --------------------------------------------------------------------------
// --- COLUMN DEFINITIONS ---
// --------------------------------------------------------------------------

function buildColumns(
  averageVolume: number,
  onSave: (id: number, grade: number | null, comment: string) => void
) {
  return [
    columnHelper.accessor("reviewerName", {
      header: ({ column }) => <SortableHeader label="Reviewer" column={column} />,
      cell: ({ row }) => (
        <>
          <Link to={`/users/${row.original.reviewerId}`}>
            <strong>{row.original.reviewerName}</strong>
          </Link>
          <br />({row.original.reviewerUsername})
        </>
      ),
    }),
    columnHelper.accessor("reviewsCompleted", {
      header: ({ column }) => <SortableHeader label="Reviews Done" column={column} />,
      cell: ({ row }) => (
        <>
          {row.original.reviewsCompleted}/{row.original.reviewsSelected}
          <br />
          <a href="#">(Summary)</a>
        </>
      ),
    }),
    columnHelper.accessor("teamReviewedName", {
      header: ({ column }) => <SortableHeader label="Team reviewed" column={column} />,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <span className={`text-${r.teamReviewedStatus}`} style={{ maxWidth: "200px" }}>
            {r.teamReviewedName} <br />
            <small>
              {getTeamStatusText(r.teamReviewedStatus)} {r.hasConsent && "✔"}
            </small>
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "scoresAwarded",
      header: ({ column }) => <SortableHeader label="Scores Awarded" column={column} isSortable={true} />,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.rounds?.[0]?.calculatedScore ?? -1;
        const b = rowB.original.rounds?.[0]?.calculatedScore ?? -1;
        return a - b;
      },
      cell: ({ row }) => {
        const rounds = row.original.rounds;
        if (!rounds?.length) return "-";
        return (
          <>
            {rounds.map((round, i) => {
              const pct =
                round.calculatedScore !== null && round.maxScore && round.maxScore > 0
                  ? Math.round((round.calculatedScore / round.maxScore) * 100)
                  : 0;
              return (
                <div key={i}>
                  Round {round.round}: {round.calculatedScore !== null ? `${pct}%` : "-"}
                </div>
              );
            })}
          </>
        );
      },
    }),
    columnHelper.display({
      id: "metrics",
      header: ({ column }) => <SortableHeader label="Metrics (Volume)" column={column} isSortable={true} />,
      enableSorting: true,
      size: 220,
      minSize: 200,
      maxSize: 240,
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.rounds?.[0]?.reviewVolume ?? rowA.original.reviewVolume ?? 0;
        const b = rowB.original.rounds?.[0]?.reviewVolume ?? rowB.original.reviewVolume ?? 0;
        return a - b;
      },
      cell: ({ row }) => {
        const rounds = row.original.rounds;
        if (!rounds?.length) return "-";
        return (
          <div style={{ width: "100%", maxWidth: "220px" }}>
            {rounds.map((round, i) => (
              <div key={i} className="mb-3">
                {rounds.length > 1 && (
                  <div style={{ fontSize: "0.85rem", fontWeight: "bold", textAlign: "center", marginBottom: "5px" }}>
                    Round {round.round}
                  </div>
                )}
                <MetricsChart
                  reviewVolume={round.reviewVolume}
                  reviewCommentCount={round.reviewCommentCount}
                  averageVolume={averageVolume}
                />
              </div>
            ))}
          </div>
        );
      },
    }),
    columnHelper.accessor("assignedGrade", {
      header: () => <span className="review-report-th">Assign grade and write comments</span>,
      size: 320,
      minSize: 300,
      enableSorting: false,
      cell: ({ row }) => <GradeCommentCell review={row.original} onSave={onSave} />,
    }),
  ];
}

// --------------------------------------------------------------------------
// --- MAIN COMPONENT ---
// --------------------------------------------------------------------------

const ReviewReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reviewData, setReviewData] = useState<ReviewData[]>([]);
  const [averageVolume, setAverageVolume] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string, type: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get(`/review_reports/${id}`);
        setReviewData(response.data.reportData);
        setAverageVolume(response.data.averageVolume);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSaveGrade = useCallback(async (reviewId: number, grade: number | null, comment: string) => {
    try {
      await axiosClient.patch(`/review_reports/${reviewId}/update_grade`, {
        assignedGrade: grade,
        instructorComment: comment
      });
      setNotification({ msg: "Grade updated successfully", type: "success" });
      setReviewData(prev => prev.map(r => r.id === reviewId ? { ...r, assignedGrade: grade, instructorComment: comment, teamReviewedStatus: "brown" } : r));
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ msg: "Failed to update grade", type: "danger" });
    }
  }, []);

  const handleExportCSV = () => {
    const headers = ["Reviewer Name", "Reviewer Username", "Team Reviewed", "Score", "Assigned Grade", "Instructor Comment"];
    const rows = reviewData.map(r => [
      `"${r.reviewerName}"`,
      `"${r.reviewerUsername}"`,
      `"${r.teamReviewedName}"`,
      r.calculatedScore,
      r.assignedGrade,
      `"${r.instructorComment || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "review_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return reviewData;
    const lowerTerm = searchTerm.toLowerCase();
    return reviewData.filter(
      (r) =>
        r.reviewerName.toLowerCase().includes(lowerTerm) ||
        r.reviewerUsername.toLowerCase().includes(lowerTerm)
    );
  }, [reviewData, searchTerm]);

  const tableColumns = useMemo(
    () => buildColumns(averageVolume, handleSaveGrade),
    [averageVolume, handleSaveGrade]
  );

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <h2 className="text-danger">Error loading report</h2>
        <p>{error}</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 review-report-page">
      {notification && (
        <Alert className={`flash_note alert alert-${notification.type}`} variant={notification.type} onClose={() => setNotification(null)} dismissible>
          {notification.msg}
        </Alert>
      )}

      <div className="review-report-selector">
        <select name="reports" id="report-select">
          <option value="review">Review report</option>
          <option value="summary">Summary report</option>
          <option value="detailed">Detailed report</option>
        </select>
        <Button variant="outline-secondary" type="button">View</Button>
      </div>

      <h2 style={{ textAlign: "left" }}>
        Review Report for Final Project (and Design Doc)
      </h2>
      <a href="#" className="review-report-back-link">Back</a>

      <div className="review-report-search-row">
        <Form.Label className="mb-0">Reviewer's Name</Form.Label>
        <div className="review-report-search-group">
          <Form.Control
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-secondary">Search</Button>
        </div>
      </div>

      <div className="legend mt-3">
        <p>
          <strong>**In "Team reviewed” column text in:</strong>
        </p>
        <ul>
          <li>
            <span className="legend-red">red</span> indicates that the review is
            not completed in any rounds;
          </li>
          <li>
            <span className="legend-blue">blue</span> indicates that a review is
            completed in every round and the review grade is not assigned;
          </li>
          <li>
            <span className="legend-green">green</span> indicates that there is
            no submitted work to review within the round;
          </li>
          <li>
            <span className="legend-purple">purple</span> indicates that there
            is no review for a submitted work within the round;
          </li>
          <li>
            <span className="legend-brown">brown</span> indicates that the review
            grade has been assigned;
          </li>
          <li>
            ✔ Check mark indicates that the student has given consent to make
            the reviews public
          </li>
        </ul>
      </div>

      <Button className="btn btn-md mb-3" variant="outline-secondary" onClick={handleExportCSV}>Export Review Scores To CSV File</Button>

      <div className="review-report-table-wrapper">
        <Table
          data={filteredData}
          columns={tableColumns}
          showGlobalFilter={false}
          showColumnFilter={false}
          showPagination={filteredData.length >= 10}
        />
      </div>
    </Container>
  );
};

export default ReviewReportPage;
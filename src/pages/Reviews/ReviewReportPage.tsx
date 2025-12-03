import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Table,
  Spinner,
  Button,
  Form,
  InputGroup,
  Alert
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
import axiosClient from "../../utils/axios_client";
import "./Reviews.css";

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
// --- TABLE ROW COMPONENT ---
// --------------------------------------------------------------------------

interface ReviewReportRowProps {
  review: ReviewData;
  index: number;
  averageVolume: number;
  onSave: (id: number, grade: number | null, comment: string) => void;
}

const ReviewReportRow: React.FC<ReviewReportRowProps> = ({
  review,
  index,
  averageVolume,
  onSave
}) => {
  const rowClassName = index % 2 === 0 ? "table-light" : "";
  const [grade, setGrade] = useState<number | string>(review.assignedGrade || "");
  const [comment, setComment] = useState<string>(review.instructorComment || "");

  const handleSave = () => {
    const numGrade = grade === "" ? null : Number(grade);
    onSave(review.id, numGrade, comment);
  };

  const teamStatusText =
    review.teamReviewedStatus === "red"
      ? "Not Completed"
      : review.teamReviewedStatus === "blue"
        ? "Completed, No Grade"
        : review.teamReviewedStatus === "green"
          ? "No Submitted Work"
          : review.teamReviewedStatus === "purple"
            ? "No Review"
            : "Grade Assigned";

  return (
    <tr className={rowClassName}>
      <td>
        <Link to={`/users/${review.reviewerId}`}>
          <strong>{review.reviewerName}</strong>
        </Link>
        <br />({review.reviewerUsername})
      </td>
      <td>
        {review.reviewsCompleted}/{review.reviewsSelected}
        <br />
        <a href="#">(Summary)</a>
      </td>
      <td
        className={`text-${review.teamReviewedStatus}`}
        style={{ maxWidth: "200px" }}
      >
        {review.teamReviewedName} <br />
        <small>
          {teamStatusText} {review.hasConsent && "✔"}
        </small>
      </td>
      <td>
        {review.rounds && review.rounds.length > 0 ? (
          review.rounds.map((round, i) => {
            const scorePercentage = (round.calculatedScore !== null && round.maxScore && round.maxScore > 0)
              ? Math.round((round.calculatedScore / round.maxScore) * 100)
              : 0;
            return (
              <div key={i}>
                Round {round.round}: {round.calculatedScore !== null ? `${scorePercentage}%` : "-"}
              </div>
            );
          })
        ) : (
          "-"
        )}
      </td>
      <td style={{ width: "300px", minWidth: "300px", maxWidth: "300px" }}>
        {review.rounds && review.rounds.length > 0 ? (
          review.rounds.map((round, i) => (
            <div key={i} className="mb-3">
              <div style={{ fontSize: "0.85rem", fontWeight: "bold", textAlign: "center", marginBottom: "5px" }}>
                Round {round.round}
              </div>
              <MetricsChart
                reviewVolume={round.reviewVolume}
                reviewCommentCount={round.reviewCommentCount}
                averageVolume={averageVolume}
              />
            </div>
          ))
        ) : (
          "-"
        )}
      </td>
      <td style={{ minWidth: "250px" }}>
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
        <Button size="sm" className="mt-1" onClick={handleSave}>
          Save
        </Button>
      </td>
    </tr>
  );
};

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

  const handleSaveGrade = async (reviewId: number, grade: number | null, comment: string) => {
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
  };

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
    <Container fluid className="p-4">
      {notification && (
        <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
          {notification.msg}
        </Alert>
      )}

      <select name="reports" id="report-select">
        <option value="review">Review report</option>
        <option value="summary">Summary report</option>
        <option value="detailed">Detailed report</option>
      </select>
      <button type="button">View</button>

      <h2 style={{ textAlign: "left" }}>
        Review report for Final project (and design doc)
      </h2>
      <a href="#">Back</a>

      <div style={{ marginTop: "15px" }}>
        <Form.Label>Reviewer's Name</Form.Label>
        <Form.Control
          type="text"
          style={{ width: "250px", display: "inline-block" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button className="ms-2">Search</Button>
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

      <Button className="mb-3" onClick={handleExportCSV}>Export Review Scores To CSV File</Button>

      <Table bordered className="review-report-table">
        <thead>
          <tr>
            <th>Reviewer</th>
            <th>Reviews Done</th>
            <th style={{ minWidth: "200px" }}>Team reviewed</th>
            <th>Scores Awarded</th>
            <th style={{ minWidth: "300px" }}>Metrics (Volume)</th>
            <th style={{ minWidth: "250px" }}>Assign grade and write comments</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((review, index) => (
            <ReviewReportRow
              key={review.id}
              review={review}
              index={index}
              averageVolume={averageVolume}
              onSave={handleSaveGrade}
            />
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ReviewReportPage;
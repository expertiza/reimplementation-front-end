import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Table,
  Spinner,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell, // <-- FIX: Added Cell import
} from "recharts";
import "./Reviews.css"; // <-- your CSS goes here

// --------------------------------------------------------------------------
// --- INTERFACES & UTILITIES ---
// --------------------------------------------------------------------------

interface ReviewData {
  reviewerName: string;
  reviewerUsername: string;
  reviewsCompleted: number;
  reviewsSelected: number;
  teamReviewedName: string;
  teamReviewedStatus: "red" | "blue" | "green" | "purple" | "brown";
  hasConsent: boolean;
  calculatedScore: number | null; // Score from aggregate_questionnaire_score
  reviewComment: string | null; // Text for Volume Metric
  // Grade and comment fields for instructor/TA to input
  assignedGrade: number | null;
  instructorComment: string;
}

/**
 * Calculates the 'volume' of a review text, defined as the number of unique words.
 * @param text The review comment text.
 * @returns The count of unique words.
 */
const calculateVolume = (text: string | null): number => {
  if (!text) {
    return 0;
  }

  // 1. Convert to lowercase and match word boundaries
  const words = text.toLowerCase().match(/\b\w+\b/g);

  if (!words) {
    return 0;
  }

  // 2. Use a Set to get only the unique words.
  const uniqueWords = new Set(words);

  return uniqueWords.size;
};

// --------------------------------------------------------------------------
// --- METRICS CHART COMPONENT (Uses Recharts) ---
// --------------------------------------------------------------------------

interface MetricsChartProps {
  reviewVolume: number;
  averageVolume: number;
}

const MetricsChart: React.FC<MetricsChartProps> = ({
  reviewVolume,
  averageVolume,
}) => {
  const data = [
    { name: "Your Review", value: reviewVolume, color: "#8884d8" },
    { name: "Assignment Avg", value: averageVolume, color: "#82ca9d" },
  ];

  return (
    <div style={{ width: "100%", height: 100 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 0, left: 5, bottom: 5 }}
        >
          {/* YAxis shows the comparison label (Review vs. Average) */}
          <YAxis dataKey="name" type="category" stroke="#343a40" fontSize={10} />

          {/* XAxis shows the volume number (unique word count) - Hidden as requested */}
          <XAxis
            type="number"
            hide={true}
            domain={[0, Math.max(reviewVolume, averageVolume) * 1.2]}
          />

          <Tooltip
            formatter={(value: number) => [`${value} unique words`, "Volume"]}
          />

          {/* FIX: Use Cell components inside Bar for dynamic coloring */}
          <Bar dataKey="value"> 
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Optional text showing the raw number comparison */}
      <small style={{ display: "block", textAlign: "center", fontSize: "0.75rem" }}>
        {reviewVolume} words ({averageVolume.toFixed(1)} Avg.)
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
}

const ReviewReportRow: React.FC<ReviewReportRowProps> = ({
  review,
  index,
  averageVolume,
}) => {
  // Logic for alternating row color (good practice)
  const rowClassName = index % 2 === 0 ? "table-light" : ""; 

  const reviewVolume = useMemo(() => calculateVolume(review.reviewComment), [
    review.reviewComment,
  ]);

  // Determine status display text and class based on colors specified in the legend
  const teamStatusText =
    review.teamReviewedStatus === "red"
      ? "Not Completed" // red
      : review.teamReviewedStatus === "blue"
      ? "Completed, No Grade" // blue
      : review.teamReviewedStatus === "green"
      ? "No Submitted Work" // green
      : review.teamReviewedStatus === "purple"
      ? "No Review" // purple
      : "Grade Assigned"; // brown

  return (
    <tr className={rowClassName}>
      {/* Reviewer Column */}
      <td>
        <strong>{review.reviewerName}</strong>
        <br />({review.reviewerUsername})
      </td>

      {/* Reviews Done Column */}
      <td>
        {review.reviewsCompleted}/{review.reviewsSelected}
      </td>

      {/* Team Reviewed Column (Color Coded, narrower) */}
      <td
        className={`text-${review.teamReviewedStatus}`}
        style={{ maxWidth: "200px" }}
      >
        {review.teamReviewedName} <br />
        <small>
          {teamStatusText} {review.hasConsent && "✔"}
        </small>
      </td>

      {/* Scores Awarded Column */}
      <td>{review.calculatedScore !== null ? `${review.calculatedScore}/5` : "-"}</td>

      {/* Metrics Column (The new chart) */}
      <td style={{ minWidth: "150px" }}>
        {review.calculatedScore !== null && ( // Only show if review is completed
          <MetricsChart
            reviewVolume={reviewVolume}
            averageVolume={averageVolume}
          />
        )}
      </td>

      {/* Assign grade and write comments Column (Text Boxes as required) */}
      <td style={{ minWidth: "250px" }}>
        <InputGroup className="mb-2">
          <Form.Control
            type="number"
            placeholder="Grade"
            style={{ width: "80px", display: "inline-block" }}
            defaultValue={review.assignedGrade || ""}
          />
          <InputGroup.Text> / 100</InputGroup.Text>
        </InputGroup>
        <Form.Control
          as="textarea"
          rows={2}
          placeholder="Instructor Comments"
          defaultValue={review.instructorComment}
        />
        <Button size="sm" className="mt-1">
          Save
        </Button>
      </td>
    </tr>
  );
};

// --------------------------------------------------------------------------
// --- MOCK DATA AND MAIN COMPONENT ---
// --------------------------------------------------------------------------

// Sample data structure based on successful seeding
const mockReviewData: ReviewData[] = [
  {
    reviewerName: "E2562 Reviewer 1",
    reviewerUsername: "e2562_reviewer_1",
    reviewsCompleted: 1,
    reviewsSelected: 1,
    teamReviewedName: "E2562_Target_Team",
    teamReviewedStatus: "brown",
    hasConsent: true,
    calculatedScore: 5,
    reviewComment:
      "Excellent and thorough review. Very detailed comments on the architecture and implementation logic. I read every line.",
    assignedGrade: 90,
    instructorComment: "High quality review, well articulated. Good score justification.",
  },
  {
    reviewerName: "E2562 Reviewer 2",
    reviewerUsername: "e2562_reviewer_2",
    reviewsCompleted: 1,
    reviewsSelected: 1,
    teamReviewedName: "E2562_Target_Team",
    teamReviewedStatus: "blue",
    hasConsent: false,
    calculatedScore: 3,
    reviewComment:
      "Good review overall. Needs more technical depth and better assessment of the prototype.",
    assignedGrade: null,
    instructorComment: "",
  },
  {
    reviewerName: "E2562 Reviewer 3",
    reviewerUsername: "e2562_reviewer_3",
    reviewsCompleted: 0,
    reviewsSelected: 1,
    teamReviewedName: "E2562_Target_Team",
    teamReviewedStatus: "red",
    hasConsent: false,
    calculatedScore: null,
    reviewComment: null,
    assignedGrade: null,
    instructorComment: "",
  },
  {
    reviewerName: "E2562 Reviewer 4",
    reviewerUsername: "e2562_reviewer_4",
    reviewsCompleted: 1,
    reviewsSelected: 1,
    teamReviewedName: "E2562_Target_Team",
    teamReviewedStatus: "brown",
    hasConsent: true,
    calculatedScore: 4,
    reviewComment: "Solid feedback. Just a few words.",
    assignedGrade: 85,
    instructorComment: "Completed. A bit brief.",
  },
];

const ReviewReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // --- Calculate Average Volume for Metrics Chart ---
  const { averageVolume, completedReviewsCount } = useMemo(() => {
    let totalUniqueWords = 0;
    let completedReviews = 0;

    for (const review of mockReviewData) {
      if (review.calculatedScore !== null) {
        totalUniqueWords += calculateVolume(review.reviewComment);
        completedReviews++;
      }
    }

    return {
      averageVolume: completedReviews > 0 ? totalUniqueWords / completedReviews : 0,
      completedReviewsCount: completedReviews,
    };
  }, []);

  const isLoading = false;
  const error = null;

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
        <p>{(error as Error).message}</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      {/* Report Selector and View Button */}
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

      {/* Search box */}
      <div style={{ marginTop: "15px" }}>
        <Form.Label>Reviewer's Name</Form.Label>
        <Form.Control
          type="text"
          style={{ width: "250px", display: "inline-block" }}
        />
        <Button className="ms-2">Search</Button>
      </div>

      {/* Legend */}
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

      {/* Export Button (Functionality needs to be implemented separately) */}
      <Button className="mb-3">Export Review Scores To CSV File</Button>

      <Table bordered className="review-report-table">
        <thead>
          <tr>
            {/* Reviewer, Reviews Done, and Team reviewed columns (reimplemented as required) */}
            <th>Reviewer</th>
            <th>Reviews Done</th>
            <th style={{ minWidth: "200px" }}>Team reviewed</th>
            
            {/* Scores Awarded (single column, AVG Score removed per requirement) */}
            <th>Scores Awarded</th>
            
            {/* Metrics Column (Reimplemented with chart) */}
            <th style={{ minWidth: "150px" }}>Metrics (Volume)</th>
            
            {/* Assign grade and comments column (reimplemented with input boxes) */}
            <th style={{ minWidth: "250px" }}>Assign grade and write comments</th>
          </tr>
        </thead>

        <tbody>
          {mockReviewData.map((review, index) => (
            <ReviewReportRow
              key={index}
              review={review}
              index={index}
              averageVolume={averageVolume}
            />
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ReviewReportPage;
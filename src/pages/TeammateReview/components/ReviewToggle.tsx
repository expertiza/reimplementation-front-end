// src/pages/TeammateReview/components/ReviewToggle.tsx

import React from "react";
import { Button } from "react-bootstrap";
import { boolean } from "yup";

interface ReviewToggleProps {
  viewMode: "given" | "received";
  onToggle: (mode: "given" | "received") => void;
  showTeammateReviews?: boolean;
  isInstructor?: boolean;
  disabled?: boolean;
}

const ReviewToggle: React.FC<ReviewToggleProps> = ({
  viewMode,
  onToggle,
  showTeammateReviews = true,
  isInstructor = false,
}) => {
  // If student and teammate reviews are not allowed, only show "Reviews Given"
  if (!isInstructor && !showTeammateReviews) {
    return (
      <div className="review-toggle">
        <Button
          variant={viewMode === "given" ? "primary" : "outline-primary"}
          onClick={() => onToggle("given")}
        >
          Reviews given
        </Button>
      </div>
    );
  }

  return (
    <div className="review-toggle">
      <Button
        variant={viewMode === "given" ? "primary" : "outline-primary"}
        onClick={() => onToggle("given")}
        className="me-2"
      >
        Reviews given
      </Button>
      <Button
        variant={viewMode === "received" ? "primary" : "outline-primary"}
        onClick={() => onToggle("received")}
      >
        Reviews received
      </Button>
    </div>
  );
};

export default ReviewToggle;

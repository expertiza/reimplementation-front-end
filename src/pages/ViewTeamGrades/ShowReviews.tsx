import React, { useState } from "react";
import { getColorClass } from "./utils";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";

// Truncatable text component
const TruncatableText: React.FC<{ text: string; wordLimit?: number }> = ({ text, wordLimit = 10 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const words = text.split(" ");
  const shouldTruncate = words.length > wordLimit;
  const displayText = isExpanded || !shouldTruncate
    ? text
    : words.slice(0, wordLimit).join(" ");

  return (
    <span>
      {displayText}
      {shouldTruncate && (
        <span
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            color: "#b00404",
            cursor: "pointer",
            fontWeight: "bold",
            marginLeft: "4px"
          }}
        >
          {isExpanded ? " [show less]" : "..."}
        </span>
      )}
    </span>
  );
};

//props for the ShowReviews
interface ReviewComment {
  name: string;
  score?: number;
  comment?: string;
  textResponse?: string;
  selections?: string[];
  selectedOption?: string;
  fileName?: string;
  fileUrl?: string;
}

interface Review {
  questionNumber: string;
  questionText: string;
  itemType?: string;
  reviews: ReviewComment[];
  RowAvg: number;
  maxScore: number;
}

interface ShowReviewsProps {
  data: Review[][];
  roundSelected: number;
  targetReview?: {roundIndex: number, reviewIndex: number} | null;
  onReviewExpanded?: () => void;
}

// Collapsible Round Component
const CollapsibleRound: React.FC<{
  roundIndex: number;
  roundData: Review[];
  isStudent: boolean;
  expandAll: boolean;
  targetReview?: {roundIndex: number, reviewIndex: number} | null;
  onReviewExpanded?: () => void;
}> = ({ roundIndex, roundData, isStudent, expandAll, targetReview, onReviewExpanded }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync with expandAll prop
  React.useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  // Auto-expand if this is the target round
  React.useEffect(() => {
    if (targetReview && targetReview.roundIndex === roundIndex) {
      setIsExpanded(true);
    }
  }, [targetReview, roundIndex]);

  const num_of_questions = roundData.length;
  const num_of_reviews = roundData[0]?.reviews.length || 0;

  return (
    <div style={{ marginBottom: "10px" }} ref={containerRef}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          textAlign: "left",
          background: "#b00404",
          border: "2px solid #b00404",
          borderRadius: "0.375rem",
          cursor: "pointer",
          padding: "8px 16px",
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
          fontFamily: "verdana, arial, helvetica, sans-serif",
          width: "15%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "background-color 0.3s ease"
        }}
      >
        <span style={{ fontSize: "10px" }}>{isExpanded ? "▼" : "▶"}</span>
  <span>Round {roundIndex + 1}({num_of_reviews} reviews, {num_of_questions} items)</span>
      </button>

      {isExpanded && (
        <div style={{ padding: "10px 0", display: "table", width: "auto" }}>
          {Array.from({ length: num_of_reviews }, (_, i) => (
            <CollapsibleReview
              key={`round-${roundIndex}-review-${i}`}
              reviewIndex={i}
              roundData={roundData}
              isStudent={isStudent}
              expandAll={expandAll}
              targetReview={targetReview}
              roundIndex={roundIndex}
              onReviewExpanded={onReviewExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Collapsible Review Component
const CollapsibleReview: React.FC<{
  reviewIndex: number;
  roundData: Review[];
  isStudent: boolean;
  expandAll: boolean;
  targetReview?: {roundIndex: number, reviewIndex: number} | null;
  roundIndex: number;
  onReviewExpanded?: () => void;
}> = ({ reviewIndex, roundData, isStudent, expandAll, targetReview, roundIndex, onReviewExpanded }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Sync with expandAll prop
  React.useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  // Auto-expand and scroll if this is the target review
  React.useEffect(() => {
    if (targetReview && 
        targetReview.roundIndex === roundIndex && 
        targetReview.reviewIndex === reviewIndex) {
      setIsExpanded(true);
      
      // Scroll to this review after a delay
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Call the callback to clear the target
        if (onReviewExpanded) {
          onReviewExpanded();
        }
      }, 300);
    }
  }, [targetReview, roundIndex, reviewIndex, onReviewExpanded]);

  return (
    <div style={{ marginBottom: "8px", marginLeft: "0" }} ref={contentRef}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          textAlign: "left",
          background: "white",
          border: "2px solid #b00404",
          borderRadius: "2px",
          cursor: "pointer",
          padding: "8px 16px",
          color: "#b00404",
          fontWeight: "bold",
          fontSize: "14px",
          fontFamily: "verdana, arial, helvetica, sans-serif",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "background-color 0.3s ease"
        }}
      >
        <span style={{ fontSize: "10px" }}>{isExpanded ? "▼" : "▶"}</span>
  <span>Review {reviewIndex + 1} ({roundData.length} items)</span>
      </button>

      {isExpanded && (
        <div style={{ padding: "15px 20px", display: "inline-block", minWidth: "100%" }}>
          {roundData.map((question, j) => (
            <div key={`question-${j}-review-${reviewIndex}`} className="review-block" style={{ marginBottom: "15px", minWidth: "max-content" }}>
              <div className="question" style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "14px", whiteSpace: "nowrap" }}>
                {j + 1}. {question.questionText}
              </div>
              <div className="score-container" style={{ marginLeft: "15px" }}>
                {question.reviews[reviewIndex].score !== undefined ? (
                  // Scored items (Scale, Criterion)
                  <>
                    <span
                      className={`score ${getColorClass(
                        question.reviews[reviewIndex].score!,
                        question.maxScore
                      )}`}
                    >
                      {question.reviews[reviewIndex].score}
                    </span>
                    {question.reviews[reviewIndex].comment && (
                      <div className="comment" style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                        <TruncatableText text={question.reviews[reviewIndex].comment!} wordLimit={10} />
                      </div>
                    )}
                  </>
                ) : question.reviews[reviewIndex].textResponse ? (
                  // Text items (TextArea, TextField)
                  <div style={{ fontSize: "14px", color: "#555", fontStyle: "italic" }}>
                    <TruncatableText text={question.reviews[reviewIndex].textResponse!} wordLimit={15} />
                  </div>
                ) : question.reviews[reviewIndex].selections ? (
                  // Multi-select items (Checkbox)
                  <ul style={{ margin: "5px 0", paddingLeft: "20px", fontSize: "14px" }}>
                    {question.reviews[reviewIndex].selections!.map((sel, sidx) => (
                      <li key={sidx}>{sel}</li>
                    ))}
                  </ul>
                ) : question.reviews[reviewIndex].selectedOption ? (
                  // Single-select items (Dropdown, Radio)
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>
                    {question.reviews[reviewIndex].selectedOption}
                  </div>
                ) : question.reviews[reviewIndex].fileName ? (
                  // File upload
                  <div style={{ fontSize: "14px", color: "#b00404" }}>
                    {question.reviews[reviewIndex].fileUrl ? (
                      <a href={question.reviews[reviewIndex].fileUrl} target="_blank" rel="noopener noreferrer">
                        📎 {question.reviews[reviewIndex].fileName}
                      </a>
                    ) : (
                      <span>📎 {question.reviews[reviewIndex].fileName}</span>
                    )}
                  </div>
                ) : (
                  <span style={{ color: "#999" }}>No response</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

//function for ShowReviews
const ShowReviews: React.FC<ShowReviewsProps> = ({ data, roundSelected, targetReview, onReviewExpanded }) => {
  console.log("round selected: ", roundSelected);
  const rounds = data.length;
  const [expandAllReviews, setExpandAllReviews] = useState(false);

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const isStudent = auth.user.role === "Student";

  // Render collapsible rounds
  const renderReviews = () => {
    const reviewElements: JSX.Element[] = [];

    for (let r = 0; r < rounds; r++) {
      // Filter based on roundSelected
      if (roundSelected === 1 && r === 1) {
        continue;
      }
      if (roundSelected === 2 && r === 0) {
        continue;
      }

      reviewElements.push(
        <CollapsibleRound
          key={`round-${r}`}
          roundIndex={r}
          roundData={data[r]}
          isStudent={isStudent}
          expandAll={expandAllReviews}
          targetReview={targetReview}
          onReviewExpanded={onReviewExpanded}
        />
      );
    }

    return reviewElements;
  };

  return (
    <div>
      {rounds > 0 ? (
        <>
          <div style={{ marginBottom: "15px" }}>
            <button
              onClick={() => setExpandAllReviews(!expandAllReviews)}
              style={{
                background: expandAllReviews ? "#b00404" : "transparent",
                border: "2px solid #b00404",
                cursor: "pointer",
                padding: "10px 20px",
                color: expandAllReviews ? "white" : "#b00404",
                fontWeight: "bold",
                fontSize: "14px",
                fontFamily: "verdana, arial, helvetica, sans-serif",
                transition: "background-color 0.3s ease, color 0.3s ease",
                borderRadius: '0.375rem'
              }}
            >
              {expandAllReviews ? "Hide all reviews" : "Show all reviews"}
            </button>
          </div>
          {renderReviews()}
        </>
      ) : (
        <div>No reviews available</div>
      )}
    </div>
  );
};

export default ShowReviews;
import React from 'react';
import { getColorClass } from './utils';
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";

// Props for individual review comment
interface ReviewComment {
  score: number;
  comment?: string;
  name: string;
}

// Props for each review question with a set of review comments
interface Review {
  questionNumber: string;
  questionText: string;
  reviews: ReviewComment[];
  RowAvg: number;
  maxScore: number;
}

// Props for ShowReviews component, which accepts an array of review data for multiple rounds
interface ShowReviewsProps {
  data: Review[][];
}

// RoundHeading component for round titles
const RoundHeading: React.FC<{ round: number }> = ({ round }) => (
  <div className="round-heading">Round {round + 1}</div>
);

// ReviewHeading component for review titles with conditional reviewer name
const ReviewHeading: React.FC<{ reviewNumber: number; reviewerName: string; isStudent: boolean }> = ({ reviewNumber, reviewerName, isStudent }) => (
  <div className="review-heading">
    Review {reviewNumber + 1}: {!isStudent ? reviewerName : ""}
  </div>
);

// QuestionReview component for displaying each question’s review and score
const QuestionReview: React.FC<{ question: Review; review: ReviewComment }> = ({ question, review }) => (
  <div className="review-block">
    <div className="question">{question.questionNumber}. {question.questionText}</div>
    <div className="score-container">
      <span className={`score ${getColorClass(review.score, question.maxScore)}`}>
        {review.score}
      </span>
      {review.comment && <div className="comment">{review.comment}</div>}
    </div>
  </div>
);

// Main ShowReviews component
const ShowReviews: React.FC<ShowReviewsProps> = ({ data }) => {
  const rounds = data.length;

  // Authentication state from Redux store to conditionally display reviewer names
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const isStudent = auth.user.role === "Student";

  // Render the reviews or a message if there are no reviews available
  return (
    <div>
      {rounds > 0 ? (
        data.map((roundData, r) => (
          <React.Fragment key={`round-${r}`}>
            <RoundHeading round={r} />
            {roundData[0].reviews.map((_, reviewIndex) => (
              <React.Fragment key={`round-${r}-review-${reviewIndex}`}>
                <ReviewHeading
                  reviewNumber={reviewIndex}
                  reviewerName={roundData[0].reviews[reviewIndex].name}
                  isStudent={isStudent}
                />
                {roundData.map((question, questionIndex) => (
                  <QuestionReview
                    key={`round-${r}-question-${questionIndex}-review-${reviewIndex}`}
                    question={question}
                    review={question.reviews[reviewIndex]}
                  />
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))
      ) : (
        <div>No reviews available</div>
      )}
    </div>
  );
};

export default ShowReviews;

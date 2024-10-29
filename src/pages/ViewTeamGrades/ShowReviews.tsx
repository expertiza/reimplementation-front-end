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

// Component to display all reviews across multiple rounds
const ShowReviews: React.FC<ShowReviewsProps> = ({ data }) => {
  const rounds = data.length; // Number of rounds

  // Authentication state from Redux store to conditionally display reviewer names
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  // Function to render reviews for each question across rounds
  const renderReviews = () => {
    const reviewElements: JSX.Element[] = [];
    
    // Iterate over each round
    for (let r = 0; r < rounds; r++) {
      const num_of_questions = data[r].length;
      const num_of_reviews = data[r][0].reviews.length; // Assuming each question has an equal number of reviews

      // Heading for each round
      reviewElements.push(<div className="round-heading" key={`round-heading-${r}`}>Round {r + 1}</div>);

      // Iterate over each review in the current round
      for (let i = 0; i < num_of_reviews; i++) {
        
        // Reviewer heading with conditional name display based on user role
        reviewElements.push(
          <div className="review-heading" key={`review-heading-round-${r}-review-${i}`}>
            Review {i + 1}: {auth.user.role !== "Student" ? data[r][0].reviews[i].name : ""}
          </div>
        );

        // Iterate over each question in the current round to display scores and comments
        for (let j = 0; j < num_of_questions; j++) {
          reviewElements.push(
            <div
              key={`round-${r}-question-${j}-review-${i}`}
              className="review-block"
            >
              <div className="question">
                {j + 1}. {data[r][j].questionText}
              </div>
              <div className="score-container">
                {/* Display score with color class based on score percentage */}
                <span className={`score ${getColorClass(data[r][j].reviews[i].score, data[r][j].maxScore)}`}>
                  {data[r][j].reviews[i].score}
                </span>
                {/* Display comment if it exists */}
                {data[r][j].reviews[i].comment && (
                  <div className="comment">{data[r][j].reviews[i].comment}</div>
                )}
              </div>
            </div>
          );
        }
      }
    }
    
    return reviewElements;
  };

  // Render the reviews or a message if there are no reviews available
  return <div>{rounds > 0 ? renderReviews() : <div>No reviews available</div>}</div>;
};

export default ShowReviews;

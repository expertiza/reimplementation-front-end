import React from "react";
import { getColorClass } from "./utils";
import { RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";

//props for the ShowReviews
interface ReviewComment {
  score: number;
  comment?: string;
  name: string;
}

interface Review {
  questionNumber: string;
  questionText: string;
  reviews: ReviewComment[];
  RowAvg: number;
  maxScore: number;
}

interface ShowReviewsProps {
  data: Review[][];
  roundSelected: number;
}

//function for ShowReviews
const ShowReviews: React.FC<ShowReviewsProps> = ({ data, roundSelected }) => {
  console.log("round selected: ", roundSelected);
  const rounds = data.length;

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  // Render each review for every question in each round
  const renderReviews = () => {
    const reviewElements: JSX.Element[] = [];
    for (let r = 0; r < rounds; r++) {
      if (roundSelected === 1) {
        if (r == 1) {
          continue;
        }
      }
      if (roundSelected === 2) {
        if (r == 0) {
          continue;
        }
      }
      const num_of_questions = data[r].length;

      // Assuming 'reviews' array exists inside the first 'question' of the first 'round'.
      const num_of_reviews = data[r][0].reviews.length;
      reviewElements.push(<div className="round-heading">Round {r + 1}</div>);
      for (let i = 0; i < num_of_reviews; i++) {
        if (auth.user.role !== "Student") {
          reviewElements.push(<div className="review-heading">Review {i + 1}</div>);
        } else {
          reviewElements.push(<div className="review-heading">Review {i + 1}</div>);
        }
        for (let j = 0; j < num_of_questions; j++) {
          reviewElements.push(
            <div key={`round-${r}-question-${j}-review-${i}`} className="review-block">
              <div className="question">
                {j + 1}. {data[r][j].questionText}
              </div>
              <div className="score-container">
                <span
                  className={`score ${getColorClass(
                    data[r][j].reviews[i].score,
                    data[r][j].maxScore
                  )}`}
                >
                  {data[r][j].reviews[i].score}
                </span>
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

  return <div>{rounds > 0 ? renderReviews() : <div>No reviews available</div>}</div>;
};

export default ShowReviews;

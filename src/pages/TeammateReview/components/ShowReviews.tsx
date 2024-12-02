import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { getColorClass } from './TeammateHeatmap';
import './ShowReviews.scss';

interface ReviewComment {
  score: number;
  comment?: string;
  name: string;
}

interface Review {
  questionNumber: string;
  questionText: string;
  reviews: ReviewComment[];
  maxScore: number;
}

interface ShowReviewsProps {
  data: Review[];
  isAnonymous: boolean;
}

const ShowReviews: React.FC<ShowReviewsProps> = ({ data, isAnonymous }) => {
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const renderReviews = () => {
    const reviewElements: JSX.Element[] = [];
    const num_of_questions = data.length;
    const num_of_reviews = data[0]?.reviews.length || 0;

    for (let i = 0; i < num_of_reviews; i++) {
      reviewElements.push(
        <div key={`review-header-${i}`} className="review-heading">
          Review {i + 1}
          {!isAnonymous && data[0]?.reviews[i]?.name && `: ${data[0].reviews[i].name}`}
        </div>
      );

      for (let j = 0; j < num_of_questions; j++) {
        const review = data[j]?.reviews[i];
        if (review) {
          reviewElements.push(
            <div key={`question-${j}-review-${i}`} className="review-block">
              <div className="question">
                {data[j].questionNumber}. {data[j].questionText}
              </div>
              <div className="score-container">
                <span className={`score ${getColorClass(review.score, data[j].maxScore)}`}>
                  {review.score}
                </span>
                {review.comment && <div className="comment">{review.comment}</div>}
              </div>
            </div>
          );
        }
      }
    }
    return reviewElements;
  };

  return (
    <div className="reviews-container">
      {data.length > 0 ? renderReviews() : <div>No reviews available</div>}
    </div>
  );
};

export default ShowReviews;
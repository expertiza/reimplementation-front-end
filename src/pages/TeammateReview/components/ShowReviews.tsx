import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { getScoreColorClass } from '../utils';
import { ShowReviewsProps } from '../index';
import './ShowReviews.scss';

/**
 * ShowReviews Component
 * Displays detailed review information including scores and comments
 * Uses a fixed 5-point scale (0-5) for all scores
 * 
 * @component
 * @param {ShowReviewsProps} props - Component props
 * @param {Review[]} props.data - Array of review data for each question
 * @param {boolean} props.isAnonymous - Whether to anonymize reviewer names
 */
const ShowReviews: React.FC<ShowReviewsProps> = ({ data, isAnonymous }) => {
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  /**
   * Renders all reviews in a structured format
   * @returns {JSX.Element[]} Array of review elements
   */
  const renderReviews = () => {
    const reviewElements: JSX.Element[] = [];
    const num_of_questions = data.length;
    const num_of_reviews = data[0]?.reviews.length || 0;

    // Iterate through each review
    for (let i = 0; i < num_of_reviews; i++) {
      // Add review header
      reviewElements.push(
        <div key={`review-header-${i}`} className="review-heading">
          Review {i + 1}
          {!isAnonymous && data[0]?.reviews[i]?.name && `: ${data[0].reviews[i].name}`}
        </div>
      );

      // Add review details for each question
      for (let j = 0; j < num_of_questions; j++) {
        const review = data[j]?.reviews[i];
        if (review) {
          reviewElements.push(
            <div key={`question-${j}-review-${i}`} className="review-block">
              <div className="question">
                {data[j].questionNumber}. {data[j].questionText}
              </div>
              <div className="score-container">
                <span className={`score ${getScoreColorClass(review.score)}`}>
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
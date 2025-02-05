import React from 'react';
import { Table } from 'react-bootstrap';
import { HeatmapProps } from '../index';
import { getScoreColorClass, calculateAverageScore } from '../utils';
import './TeammateHeatmap.scss';

/**
 * TeammateHeatmap Component
 * Displays a heatmap visualization of teammate reviews with color-coded scores
 * Uses a fixed 5-point scale (0-5) for all scores
 * 
 * @component
 * @param {HeatmapProps} props - Component props
 * @param {QuestionReview[]} props.data - Array of review data for each question
 * @param {boolean} props.showQuestions - Whether to show question text
 * @param {boolean} props.isAnonymous - Whether to anonymize reviewer names
 * @param {number[]} props.columnAverages - Pre-calculated averages for each column
 */
const TeammateHeatmap: React.FC<HeatmapProps> = ({ 
  data, 
  showQuestions,
  isAnonymous,
  columnAverages 
}) => {
  /**
   * Get the display name for a reviewer based on anonymity settings
   * @param {string} name - Original reviewer name
   * @param {number} index - Reviewer index
   * @returns {string} Display name
   */
  const getReviewerName = (name: string, index: number): string => {
    return isAnonymous ? `Student ${100 + index}` : name;
  };

  return (
    <Table bordered className="teammate-heatmap">
      <thead>
        <tr>
          <th>Question No.</th>
          {showQuestions && <th>Question</th>}
          {data[0]?.reviews.map((review, idx) => (
            <th key={idx}>
              Review {idx + 1}
              <div className="reviewer-name">
                {getReviewerName(review.name, idx)}
              </div>
            </th>
          ))}
          <th>Average</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx}>
            <td className="question-no">
              {row.questionNumber}
            </td>
            {showQuestions && (
              <td>{row.questionText}</td>
            )}
            {row.reviews.map((review, colIdx) => (
              <td
                key={colIdx}
                className={`py-2 px-4 text-center ${getScoreColorClass(review.score)}`}
                title={review.comment}
              >
                {review.score}
              </td>
            ))}
            <td className="text-center average-cell">
              {calculateAverageScore(row.reviews).toFixed(2)}
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={showQuestions ? 2 : 1}>Column Average</td>
          {columnAverages.map((avg, idx) => (
            <td
              key={idx}
              className="text-center average-cell"
            >
              {avg.toFixed(2)}
            </td>
          ))}
        </tr>
      </tbody>
    </Table>
  );
};

export default TeammateHeatmap;
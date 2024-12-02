// src/pages/TeammateReview/components/TeammateHeatmap.tsx

import React from 'react';
import { Table } from 'react-bootstrap';
import { HeatmapProps } from '../types';
import './TeammateHeatmap.scss';

const TeammateHeatmap: React.FC<HeatmapProps> = ({ 
  data, 
  showQuestions,
  isAnonymous 
}) => {
  const getColorClass = (score: number, maxScore: number): string => {
    if (maxScore === 1) return score === 1 ? 'score-1-1' : 'score-0-1';
    
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'score-5';
    if (percentage >= 80) return 'score-4';
    if (percentage >= 70) return 'score-3';
    if (percentage >= 60) return 'score-2';
    return 'score-1';
  };

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
              <br />
              <span className="reviewer-name">
                ({getReviewerName(review.name, idx)})
              </span>
            </th>
          ))}
          <th>Avg▼</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx}>
            <td className="question-no">
              {row.maxScore === 1 ? (
                <span className="check-mark">✓</span>
              ) : (
                <span className="score-circle">{row.maxScore}</span>
              )}
              {row.questionNumber}
            </td>
            {showQuestions && <td>{row.questionText}</td>}
            {row.reviews.map((review, idx) => (
              <td 
                key={idx} 
                className={getColorClass(review.score, row.maxScore)}
                title={review.comment}
              >
                {review.score}
              </td>
            ))}
            <td>
              {(row.reviews.reduce((sum, r) => sum + r.score, 0) / row.reviews.length).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TeammateHeatmap;
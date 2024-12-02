// src/pages/TeammateReview/components/TeammateHeatmap.tsx

import React from 'react';
import { Table } from 'react-bootstrap';
import './TeammateHeatmap.scss';

interface Review {
  score: number;
  comment?: string;
}

interface ReviewRow {
  questionNumber: string;
  questionText: string;
  reviews: Review[];
  RowAvg: number;
  maxScore: number;
}

interface TeammateHeatmapProps {
  data: ReviewRow[];
  showQuestions: boolean;
}

const TeammateHeatmap: React.FC<TeammateHeatmapProps> = ({ data, showQuestions }) => {
  const getColorClass = (score: number, maxScore: number) => {
    if (maxScore === 1) {
      return score === 1 ? 'score-1-1' : 'score-0-1';
    }
    
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'score-5';
    if (percentage >= 80) return 'score-4';
    if (percentage >= 70) return 'score-3';
    if (percentage >= 60) return 'score-2';
    return 'score-1';
  };

  const reviewCount = data[0]?.reviews.length || 0;

  return (
    <Table bordered className="teammate-heatmap">
      <thead>
        <tr>
          <th>Question No.</th>
          {showQuestions && <th>Question</th>}
          {Array.from({ length: reviewCount }).map((_, idx) => (
            <th key={idx}>Review {idx + 1}</th>
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
            <td>{row.RowAvg.toFixed(2)}</td>
          </tr>
        ))}
        <tr>
          <td>Avg</td>
          {showQuestions && <td></td>}
          {Array.from({ length: reviewCount }).map((_, idx) => {
            const columnAvg = data.reduce((sum, row) => sum + row.reviews[idx].score, 0) / data.length;
            return <td key={idx}>{columnAvg.toFixed(2)}</td>;
          })}
          <td></td>
        </tr>
      </tbody>
    </Table>
  );
};

export default TeammateHeatmap;
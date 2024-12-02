import React from 'react';
import { Table } from 'react-bootstrap';
import { HeatmapProps } from '../types';
import './TeammateHeatmap.scss';

interface EnhancedHeatmapProps extends HeatmapProps {
  columnAverages: number[];
}

export const getColorClass = (score: number, maxScore: number): string => {
  if (maxScore === 1) {
    return score === 1 ? 'score-1-1' : 'score-0-1';
  }
  
  const normalizedScore = Math.round((score / maxScore) * 5);
  
  switch (normalizedScore) {
    case 0: return 'score-0';
    case 1: return 'score-1';
    case 2: return 'score-2';
    case 3: return 'score-3';
    case 4: return 'score-4';
    case 5: return 'score-5';
    default: return '';
  }
};

const TeammateHeatmap: React.FC<EnhancedHeatmapProps> = ({ 
  data, 
  showQuestions,
  isAnonymous,
  columnAverages 
}) => {
  const getReviewerName = (name: string, index: number): string => {
    return isAnonymous ? `Student ${100 + index}` : name;
  };

  const calculateRowAverage = (reviews: any[]): number => {
    const total = reviews.reduce((sum, review) => sum + review.score, 0);
    return Number((total / reviews.length).toFixed(2));
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
                className={`py-2 px-4 text-center ${getColorClass(review.score, row.maxScore)}`}
                title={review.comment}
              >
                <span style={{ textDecoration: review.comment ? "underline" : "none" }}>
                  {review.score}
                </span>
              </td>
            ))}
            <td className="text-center">
              {calculateRowAverage(row.reviews)}
            </td>
          </tr>
        ))}
        <tr className="averages-row">
          <td>Column Avg</td>
          {showQuestions && <td></td>}
          {columnAverages.map((avg, idx) => (
            <td key={idx} className="text-center">
              {avg.toFixed(2)}
            </td>
          ))}
          <td></td>
        </tr>
      </tbody>
    </Table>
  );
};

export default TeammateHeatmap;
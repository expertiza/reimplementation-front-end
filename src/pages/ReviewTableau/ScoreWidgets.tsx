import React from 'react';
import { getColorClass } from '../ViewTeamGrades/utils';
import { ScoreWidgetProps } from '../../types/reviewTableau';
import '../ViewTeamGrades/grades.scss';

/**
 * Reusable circular score widget that matches the design used in ViewTeamGrades
 * Shows a score inside a colored circle with color coding based on performance
 */
export const ScoreWidget: React.FC<ScoreWidgetProps> = ({ 
  score,
  maxScore, 
  comment, 
  hasComment = false 
}) => {
  const colorClass = getColorClass(score, maxScore);
  const title = comment ? `Score: ${score}/${maxScore}\nComment: ${comment}` : `Score: ${score}/${maxScore}`;
  
  return (
    <div className="circle-container" title={title}>
      <span 
        className={`grade-circle ${colorClass} ${hasComment ? 'underlined' : ''}`}
        style={{ 
          cursor: hasComment ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {score}
      </span>
    </div>
  );
};

/**
 * Widget for displaying maximum score in rubric column
 */
export const MaxScoreWidget: React.FC<{ maxScore: number }> = ({ maxScore }) => {
  return (
    <div className="weight-circle" data-question={`Max Score: ${maxScore}`}>
      <span className="circle">{maxScore}</span>
    </div>
  );
};

/**
 * Simple checkmark widget for boolean/completed items
 */
export const CheckWidget: React.FC<{ checked?: boolean }> = ({ checked = false }) => {
  return (
    <div className="tick">
      {checked ? '✓' : ''}
    </div>
  );
};
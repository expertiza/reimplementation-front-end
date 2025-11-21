import React from 'react';
import { ReviewCellProps } from '../../types/reviewTableau';
import { ScoreWidget, CheckWidget } from './ScoreWidgets';

/**
 * Component for displaying individual review responses in tableau cells
 * Handles different response types based on rubric item type
 */
export const ReviewCell: React.FC<ReviewCellProps> = ({ 
  item, 
  response,
  reviewerName 
}) => {
  // Handle empty responses
  if (!response) {
    return <div className="review-cell empty">—</div>;
  }

  // Handle end markers (null txt)
  if (item.txt === null) {
    return null;
  }

  const renderResponseContent = () => {
    switch (item.itemType) {
      case 'Section_header':
      case 'Table_header':
      case 'Column_header':
        // Headers don't have responses
        return <div className="header-cell">—</div>;

      case 'Criterion':
      case 'Scale':
        if (response.score !== undefined && item.maxScore) {
          return (
            <ScoreWidget 
              score={response.score} 
              maxScore={item.maxScore}
              comment={response.comment}
              hasComment={!!response.comment}
            />
          );
        }
        return <div className="no-score">—</div>;

      case 'TextField':
      case 'TextArea':
        if (response.textResponse) {
          const displayText = response.textResponse.length > 50 
            ? response.textResponse.substring(0, 47) + '...' 
            : response.textResponse;
          
          return (
            <div 
              className="text-response" 
              style={{ 
                fontSize: '12px', 
                padding: '4px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                minHeight: '20px',
                cursor: response.textResponse.length > 50 ? 'pointer' : 'default'
              }}
              title={response.textResponse}
            >
              {displayText}
            </div>
          );
        }
        return <div className="no-text">—</div>;

      case 'Dropdown':
      case 'MultipleChoice':
        if (response.selectedOption) {
          return (
            <div 
              className="selected-option" 
              style={{ 
                fontSize: '12px', 
                fontWeight: 'bold',
                color: '#b00404',
                padding: '2px 4px',
                backgroundColor: '#f8f9fa',
                borderRadius: '3px',
                textAlign: 'center'
              }}
            >
              {response.selectedOption}
            </div>
          );
        }
        return <div className="no-selection">—</div>;

      case 'Checkbox':
        if (response.selections && response.selections.length > 0) {
          return (
            <div className="checkbox-selections" style={{ fontSize: '11px' }}>
              {response.selections.map((selection, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    backgroundColor: '#e7f3ff',
                    padding: '2px 4px',
                    margin: '1px 0',
                    borderRadius: '2px',
                    fontSize: '10px'
                  }}
                >
                  ✓ {selection}
                </div>
              ))}
            </div>
          );
        }
        return <div className="no-selections">—</div>;

      case 'UploadFile':
        if (response.fileName) {
          return (
            <div className="file-upload" style={{ fontSize: '12px', textAlign: 'center' }}>
              {response.fileUrl ? (
                <a 
                  href={response.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#b00404', textDecoration: 'none' }}
                  title={`View ${response.fileName}`}
                >
                  📎 {response.fileName.length > 20 
                      ? response.fileName.substring(0, 17) + '...' 
                      : response.fileName}
                </a>
              ) : (
                <span style={{ color: '#666' }}>
                  📎 {response.fileName.length > 20 
                      ? response.fileName.substring(0, 17) + '...' 
                      : response.fileName}
                </span>
              )}
            </div>
          );
        }
        return <div className="no-file">—</div>;

      default:
        return <div className="unknown-type">—</div>;
    }
  };

  const content = renderResponseContent();
  
  // Don't render anything for end markers
  if (content === null) {
    return null;
  }

  return (
    <div 
      className="review-cell" 
      style={{ 
        padding: '8px 4px',
        textAlign: 'center',
        verticalAlign: 'middle',
        borderRight: '1px solid #ddd',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {content}
    </div>
  );
};
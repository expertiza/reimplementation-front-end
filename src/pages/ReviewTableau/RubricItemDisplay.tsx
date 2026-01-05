import React from 'react';
import { RubricItemDisplayProps } from '../../types/reviewTableau';
import { MaxScoreWidget } from './ScoreWidgets';

/**
 * Component for displaying rubric items in the left column of the tableau
 * Handles all different item types with appropriate styling
 */
export const RubricItemDisplay: React.FC<RubricItemDisplayProps> = ({ 
  item,
  isHeader = false 
}) => {
  const renderItemContent = () => {
    // Handle null txt (end markers)
    if (item.txt === null) {
      return null;
    }

    switch (item.itemType) {
      case 'Section_header':
        return (
          <div className="section-header" style={{ 
            fontWeight: 'bold', 
            fontSize: '16px', 
            padding: '10px 0',
            borderBottom: '2px solid #b00404',
            marginBottom: '5px',
            color: '#b00404'
          }}>
            {item.txt}
          </div>
        );

      case 'Table_header':
        return (
          <div className="table-header" style={{ 
            fontWeight: 'bold', 
            fontSize: '14px', 
            padding: '8px 0',
            borderBottom: '1px solid #ccc',
            backgroundColor: '#f8f9fa',
            color: '#333'
          }}>
            {item.txt}
          </div>
        );

      case 'Column_header':
        return (
          <div className="column-header" style={{ 
            fontWeight: 'bold', 
            fontSize: '13px', 
            padding: '5px 0',
            color: '#666',
            fontStyle: 'italic'
          }}>
            {item.txt}
          </div>
        );

      case 'Criterion':
      case 'Scale':
        return (
          <div className="criterion-item" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            <div style={{ flex: 1, marginRight: '10px' }}>
              <div className="item-number-with-weight">
                {item.questionNumber && (
                  <span className="item-number">{item.questionNumber}.</span>
                )}
                <span>{item.txt}</span>
              </div>
              {item.scaleDescription && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  {item.scaleDescription}
                </div>
              )}
            </div>
            {item.maxScore && (
              <MaxScoreWidget maxScore={item.maxScore} />
            )}
          </div>
        );

      case 'TextField':
      case 'TextArea':
        return (
          <div className="text-item" style={{ 
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            <div className="item-number-with-weight">
              {item.questionNumber && (
                <span className="item-number">{item.questionNumber}.</span>
              )}
              <span>{item.txt}</span>
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>
                ({item.itemType === 'TextArea' ? 'Long Text' : 'Short Text'})
              </span>
            </div>
          </div>
        );

      case 'Dropdown':
      case 'MultipleChoice':
        return (
          <div className="choice-item" style={{ 
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            <div className="item-number-with-weight">
              {item.questionNumber && (
                <span className="item-number">{item.questionNumber}.</span>
              )}
              <span>{item.txt}</span>
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>
                ({item.itemType})
              </span>
            </div>
            {item.options && item.options.length > 0 && (
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px', marginLeft: '15px' }}>
                Options: {item.options.slice(0, 3).join(', ')}
                {item.options.length > 3 ? '...' : ''}
              </div>
            )}
          </div>
        );

      case 'Checkbox':
        return (
          <div className="checkbox-item" style={{ 
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            <div className="item-number-with-weight">
              {item.questionNumber && (
                <span className="item-number">{item.questionNumber}.</span>
              )}
              <span>{item.txt}</span>
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>
                (Multiple Selection)
              </span>
            </div>
            {item.options && item.options.length > 0 && (
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px', marginLeft: '15px' }}>
                Options: {item.options.slice(0, 3).join(', ')}
                {item.options.length > 3 ? '...' : ''}
              </div>
            )}
          </div>
        );

      case 'UploadFile':
        return (
          <div className="file-item" style={{ 
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            <div className="item-number-with-weight">
              {item.questionNumber && (
                <span className="item-number">{item.questionNumber}.</span>
              )}
              <span>{item.txt}</span>
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>
                (File Upload)
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="generic-item" style={{ 
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            {item.questionNumber && (
              <span className="item-number">{item.questionNumber}.</span>
            )}
            <span>{item.txt}</span>
          </div>
        );
    }
  };

  const content = renderItemContent();
  
  // Don't render anything for end markers
  if (content === null) {
    return null;
  }

  return <div className="rubric-item">{content}</div>;
};
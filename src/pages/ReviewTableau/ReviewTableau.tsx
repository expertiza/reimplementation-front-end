import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ReviewTableauData, ReviewRound, RubricItem } from '../../types/reviewTableau';
import { RubricItemDisplay } from './RubricItemDisplay';
import { ReviewCell } from './ReviewCell';
import axiosClient from '../../utils/axios_client';
import './ReviewTableau.scss';

/**
 * Review Tableau Page
 * 
 * Displays a review rubric in the left column with subsequent columns showing
 * each reviewer's responses. Multiple rounds are supported with proper ordering.
 * 
 * Features:
 * - Clean iteration through different rubric item types
 * - Circular score widgets matching existing response views
 * - Multi-round support with proper ordering
 * - Responsive design for multiple review columns
 */
const ReviewTableau: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<ReviewTableauData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get parameters from URL
  const assignmentId = searchParams.get('assignmentId');
  const participantId = searchParams.get('participantId');

  useEffect(() => {
    const loadReviewTableauData = async () => {
      try {
        setLoading(true);
        
        // For now, we'll use mock data. In a real implementation, this would be an API call
        const mockData: ReviewTableauData = {
          rubric: [
            {
              id: '1',
              txt: 'Code Quality Assessment',
              itemType: 'Section_header'
            },
            {
              id: '2',
              txt: 'Code Organization',
              itemType: 'Criterion',
              questionNumber: '1',
              maxScore: 5,
              weight: 1
            },
            {
              id: '3',
              txt: 'Code Readability',
              itemType: 'Criterion',
              questionNumber: '2',
              maxScore: 5,
              weight: 1
            },
            {
              id: '4',
              txt: 'Additional Comments',
              itemType: 'TextArea',
              questionNumber: '3'
            },
            {
              id: '5',
              txt: 'Overall Rating',
              itemType: 'Dropdown',
              questionNumber: '4',
              options: ['Excellent', 'Good', 'Fair', 'Needs Improvement']
            },
            {
              id: '6',
              txt: 'Design Patterns Used',
              itemType: 'Checkbox',
              questionNumber: '5',
              options: ['Singleton', 'Factory', 'Observer', 'Strategy', 'Other']
            },
            {
              id: '7',
              txt: 'Documentation',
              itemType: 'UploadFile',
              questionNumber: '6'
            }
          ],
          rounds: [
            {
              roundNumber: 1,
              roundName: 'Round 1',
              reviews: [
                {
                  reviewerId: 'r1',
                  reviewerName: 'Alice Johnson',
                  roundNumber: 1,
                  responses: {
                    '2': { score: 4, comment: 'Well organized code structure' },
                    '3': { score: 3, comment: 'Could improve variable naming' },
                    '4': { textResponse: 'Overall good implementation with room for improvement' },
                    '5': { selectedOption: 'Good' },
                    '6': { selections: ['Factory', 'Observer'] },
                    '7': { fileName: 'code_review.pdf', fileUrl: '/files/code_review.pdf' }
                  }
                },
                {
                  reviewerId: 'r2',
                  reviewerName: 'Bob Smith',
                  roundNumber: 1,
                  responses: {
                    '2': { score: 5, comment: 'Excellent structure' },
                    '3': { score: 4, comment: 'Very readable' },
                    '4': { textResponse: 'Great work on this assignment' },
                    '5': { selectedOption: 'Excellent' },
                    '6': { selections: ['Singleton', 'Strategy'] },
                    '7': { fileName: 'review_notes.txt', fileUrl: '/files/review_notes.txt' }
                  }
                }
              ]
            },
            {
              roundNumber: 2,
              roundName: 'Round 2',
              reviews: [
                {
                  reviewerId: 'r3',
                  reviewerName: 'Carol Davis',
                  roundNumber: 2,
                  responses: {
                    '2': { score: 4, comment: 'Consistent organization' },
                    '3': { score: 5, comment: 'Excellent readability' },
                    '4': { textResponse: 'Shows improvement from round 1 feedback' },
                    '5': { selectedOption: 'Good' },
                    '6': { selections: ['Factory'] },
                    '7': { fileName: 'final_review.pdf', fileUrl: '/files/final_review.pdf' }
                  }
                }
              ]
            }
          ]
        };

        setData(mockData);
        setError(null);
      } catch (err) {
        console.error('Error loading review tableau data:', err);
        setError('Failed to load review data');
      } finally {
        setLoading(false);
      }
    };

    loadReviewTableauData();
  }, [assignmentId, participantId]);

  // Sort rounds by round number
  const sortedRounds = data?.rounds ? [...data.rounds].sort((a, b) => a.roundNumber - b.roundNumber) : [];

  // Filter out end marker items for display
  const visibleRubricItems = data?.rubric.filter(item => item.txt !== null) || [];

  // Generate column headers
  const generateColumnHeaders = (): string[] => {
    const headers: string[] = [];
    
    sortedRounds.forEach(round => {
      round.reviews.forEach(review => {
        headers.push(`${round.roundName} - ${review.reviewerName}`);
      });
    });

    return headers;
  };

  if (loading) {
    return (
      <div className="review-tableau-loading">
        <div className="loading-spinner">Loading review tableau...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-tableau-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="review-tableau-empty">
        <div className="empty-message">No review data available</div>
      </div>
    );
  }

  const columnHeaders = generateColumnHeaders();

  return (
    <div className="review-tableau-container">
      <div className="review-tableau-header">
        <h2>Review Tableau</h2>
        {assignmentId && (
          <div className="tableau-info">
            <span>Assignment: {assignmentId}</span>
            {participantId && <span> | Participant: {participantId}</span>}
          </div>
        )}
      </div>

      <div className="tableau-wrapper">
        <table className="review-tableau-table">
          <thead>
            <tr>
              <th className="rubric-header">Review Rubric</th>
              {columnHeaders.map((header, index) => (
                <th key={index} className="review-header">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRubricItems.map((item) => (
              <tr key={item.id} className={`rubric-row rubric-row-${item.itemType.toLowerCase()}`}>
                {/* Rubric column */}
                <td className="rubric-cell">
                  <RubricItemDisplay item={item} />
                </td>
                
                {/* Review columns */}
                {sortedRounds.map(round => (
                  round.reviews.map(review => (
                    <td key={`${round.roundNumber}-${review.reviewerId}-${item.id}`} className="review-data-cell">
                      <ReviewCell 
                        item={item}
                        response={review.responses[item.id]}
                        reviewerName={review.reviewerName}
                      />
                    </td>
                  ))
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="tableau-footer">
        <div className="review-summary">
          <span>Total Reviews: {sortedRounds.reduce((acc, round) => acc + round.reviews.length, 0)}</span>
          <span> | </span>
          <span>Rounds: {sortedRounds.length}</span>
          <span> | </span>
          <span>Rubric Items: {visibleRubricItems.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewTableau;
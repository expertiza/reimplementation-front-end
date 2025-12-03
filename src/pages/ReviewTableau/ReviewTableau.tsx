import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { ReviewTableauData, ReviewRound, RubricItem, ReviewResponse, Rubric } from '../../types/reviewTableau';
import { getReviewTableauData, transformReviewTableauData } from '../../services/gradesService';
import { ScoreWidget } from './ScoreWidgets';
import Table from '../../components/Table/Table';
import './ReviewTableau.scss';

/**
 * Review Tableau Page
 * Displays all reviews completed BY a specific reviewer (participant) for an assignment.
 * Shows reviews done by this reviewer on different teams/students across different rounds.
 */
const ReviewTableau: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<ReviewTableauData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get parameters from URL
  const reviewerId = searchParams.get('studentId'); // Optional: if we want to override the display name
  const assignmentId = searchParams.get('assignmentId');
  const participantId = searchParams.get('participantId'); // This is the reviewer's participant ID

  // Basic render/mount log to help debug routing/requests
  console.log('ReviewTableau render - params', { reviewerId, assignmentId, participantId, isLoading, error });

  useEffect(() => {
    const fetchData = async () => {
      // Check for required parameters
      if (!assignmentId || !participantId) {
        setError('Unauthorized: Missing required parameters. Please provide assignmentId and participantId in the URL.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('ReviewTableau: requesting review tableau data', { assignmentId, participantId });
        
        const apiResponse = await getReviewTableauData({
          assignmentId,
          participantId,
        });
        
        console.log('ReviewTableau: apiResponse received', apiResponse);
        
        const transformedData = transformReviewTableauData(apiResponse, reviewerId || undefined);
        setData(transformedData);
        
        console.log('ReviewTableau: data transformed and set', transformedData);
      } catch (err: any) {
        console.error('ReviewTableau: error fetching data', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch review tableau data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, participantId, reviewerId]);

  // Group by round first, then by rubrics within each round
  const roundRubricGroups = useMemo(() => {
    if (!data?.rubrics || !data?.rounds) return [];
    
    // Group rounds by round number
    const roundsMap = new Map<number, ReviewRound[]>();
    data.rounds.forEach(round => {
      if (!roundsMap.has(round.roundNumber)) {
        roundsMap.set(round.roundNumber, []);
      }
      roundsMap.get(round.roundNumber)!.push(round);
    });
    
    // Convert to array and sort by round number
    return Array.from(roundsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([roundNumber, rounds]) => ({
        roundNumber,
        roundName: `Review Round ${roundNumber}`,
        rubricRounds: rounds.map(round => {
          const rubric = data.rubrics!.find(r => r.id === round.rubricId);
          return {
            rubric,
            round
          };
        }).filter(item => item.rubric) // Only include rounds with valid rubrics
      }));
  }, [data?.rubrics, data?.rounds]);

  // Generate table data for a specific rubric and round
  const generateRubricRoundTableData = (rubric: Rubric, round: ReviewRound) => {
    return rubric.items.map(item => {
      const rowData: any = {
        id: item.id,
        item: item.txt,
        itemType: item.itemType,
        questionType: item.questionType,
        maxScore: item.maxScore
      };

      // Add response data for each reviewer in this round
      round.reviews.forEach((review, index) => {
        rowData[`reviewer_${index}`] = {
          reviewerId: review.reviewerId,
          reviewerName: review.reviewerName,
          response: review.responses[item.id]
        };
      });

      return rowData;
    });
  };

  // Generate columns for a specific round
  const generateRubricRoundColumns = (round: ReviewRound): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = [
      {
        id: 'item',
        header: 'Item',
        accessorKey: 'item',
        cell: ({ row }) => row.original.item,
        enableSorting: false,
        enableColumnFilter: false,
      }
    ];

    // Add review columns for this specific round (each column represents a different team/student reviewed)
    round.reviews.forEach((review, index) => {
      columns.push({
        id: `reviewer_${index}`,
        header: () => (
          <div className="reviewer-header-content">
            <div className="reviewer-name">{review.reviewerName}</div>
            <div className="submission-time">{review.submissionTime || ''}</div>
          </div>
        ),
        accessorKey: `reviewer_${index}`,
        cell: ({ row }) => {
          const reviewData = row.original[`reviewer_${index}`];
          if (reviewData?.response) {
            // Construct proper RubricItem object for renderReviewCell
            const item: RubricItem = {
              id: row.original.id,
              txt: row.original.item,
              itemType: row.original.itemType,
              questionType: row.original.questionType,
              maxScore: row.original.maxScore
            };
            
            return (
              <div className="response-cell-content">
                {renderReviewCell(item, reviewData.response)}
              </div>
            );
          }
          return <span className="no-response">—</span>;
        },
        enableSorting: false,
        enableColumnFilter: false,
      });
    });

    return columns;
  };

  // Helper function to render score or check/X
  const renderReviewCell = (item: RubricItem, response: any) => {
    if (!response) return <span className="no-response">—</span>;
    
    // Handle different question types based on both itemType and questionType
    const questionType = item.questionType || item.itemType;
    
    // Scale and Criterion questions with numeric scores
    if ((questionType === 'Scale' || questionType === 'Criterion' || item.itemType === 'Criterion') && response.score !== undefined) {
      if (item.maxScore) {
        return <ScoreWidget score={response.score} maxScore={item.maxScore} comment={response.comment} hasComment={!!response.comment} />;
      } else {
        // If no max score defined, just show the score value
        return (
          <div className="score-simple">
            <span className="score-value">{response.score}</span>
            {response.comment && <span className="comment-indicator" title={response.comment}>💬</span>}
          </div>
        );
      }
    }
    
    // Dropdown questions
    if (questionType === 'Dropdown' && (response.selectedOption !== undefined || response.score !== undefined)) {
      const displayValue = response.selectedOption || response.score;
      return (
        <div className="dropdown-response">
          <span className="selected-option">{displayValue}</span>
          {response.comment && <span className="comment-indicator" title={response.comment}>💬</span>}
        </div>
      );
    }
    
    // Checkbox questions
    if ((questionType === 'Checkbox' || item.itemType === 'Checkbox') && response.checkValue !== undefined) {
      return (
        <span className={`check-icon ${response.checkValue ? 'check-true' : 'check-false'}`}>
          {response.checkValue ? (
            <img src="/assets/icons/Check-icon.png" alt="✓" />
          ) : (
            <img src="/assets/icons/delete-temp.png" alt="✗" />
          )}
        </span>
      );
    }
    
    // Text-based questions
    if ((questionType === 'TextArea' || questionType === 'TextField') && response.textResponse !== undefined) {
      return (
        <div className="text-response-cell">
          {response.textResponse || '—'}
        </div>
      );
    }
    
    return <span className="no-response">—</span>;
  };

  if (isLoading) {
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

  return (
    <div className="review-by-student-container">
      {/* Header */}
      <h2 className="main-title">Reviews By {data.studentId}</h2>
      
      {/* Course and Assignment Info */}
      <div className="course-info">
        <div><strong>Course :</strong> {data.course}</div>
        <div><strong>Assignment:</strong> {data.assignment}</div>
      </div>

      {/* Render by round first, then rubrics within each round */}
      {roundRubricGroups.map((roundGroup) => (
        <div key={roundGroup.roundNumber} className="round-section">
          <h1 className="round-title-main">{roundGroup.roundName}</h1>
          
          {roundGroup.rubricRounds.map((rubricRound) => {
            if (!rubricRound.rubric) return null;
            
            const tableData = generateRubricRoundTableData(rubricRound.rubric, rubricRound.round);
            const columns = generateRubricRoundColumns(rubricRound.round);

            return (
              <div key={`${roundGroup.roundNumber}_${rubricRound.rubric.id}`} className="rubric-section">
                
                <div className="review-table-wrapper">
                  <Table
                    data={tableData}
                    columns={columns}
                    disableGlobalFilter={true}
                    showGlobalFilter={false}
                    showColumnFilter={false}
                    showPagination={true}
                    columnVisibility={{}}
                    tableSize={{ span: 12, offset: 0 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ReviewTableau;
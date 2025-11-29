import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { ReviewTableauData, ReviewRound, RubricItem, ReviewResponse, Rubric } from '../../types/reviewTableau';
import useAPI from '../../hooks/useAPI';
import { ScoreWidget } from './ScoreWidgets';
import Table from '../../components/Table/Table';
import './ReviewTableau.scss';

/**
 * Review by Student Page
 * Displays reviews for a single student.
 * Shows each round as a separate section
 */
const ReviewTableau: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<ReviewTableauData | null>(null);
  // useAPI hook (follows pattern used in Participants.tsx)
  const { error: apiError, isLoading: apiLoading, data: apiResponse, sendRequest: fetchGrades } = useAPI();
  
  // Get parameters from URL
  const studentId = searchParams.get('studentId') || '10836';
  const assignmentId = searchParams.get('assignmentId');
  const participantId = searchParams.get('participantId');

  // Basic render/mount log to help debug routing/requests
  console.log('ReviewTableau render - params', { studentId, assignmentId, participantId, apiLoading, apiError });

  useEffect(() => {
    console.log('ReviewTableau: requesting grades via useAPI', { studentId, assignmentId, participantId });
    // sendRequest expects an AxiosRequestConfig-like object
    fetchGrades({ url: `/grades/2/edit`, method: 'GET' });
  }, [fetchGrades, studentId, assignmentId, participantId]);

  // Map apiResponse (AxiosResponse) to local ReviewTableauData state
  useEffect(() => {
    if (!apiResponse) return;
    try {
      const resp = apiResponse.data;
      console.log('ReviewTableau: apiResponse received', resp);

      const itemsObj = resp?.items || {};
      const rubrics: Rubric[] = Object.entries(itemsObj).map(([qId, itemsArr]: any) => {
        const first = Array.isArray(itemsArr) && itemsArr.length > 0 ? itemsArr[0] : null;
        const name = first?.questionnaire?.name || `Questionnaire ${qId}`;
        return {
          id: `q_${qId}`,
          name,
          items: (itemsArr || []).map((it: any, idx: number) => ({
            id: String(it.seq ?? idx + 1),
            txt: it.txt ?? null,
            itemType: it.question_type === 'Scale' ? 'Criterion' : (it.question_type === 'Checkbox' ? 'Checkbox' : (it.question_type === 'TextArea' ? 'TextArea' : 'Criterion')),
            maxScore: it.question_type === 'Scale' ? 5 : undefined,
          }))
        } as Rubric;
      });

      console.log('ReviewTableau: mapped rubrics count', { rubricsCount: rubrics.length });

      // Extract reviews from scores.my_team.reviews_of_our_work
      const scoresData = resp?.scores || {};
      const reviewsOfOurWork = scoresData?.my_team?.reviews_of_our_work || {};
      
      console.log('ReviewTableau: reviewsOfOurWork structure', { keys: Object.keys(reviewsOfOurWork), data: reviewsOfOurWork });

      // Convert reviews_of_our_work format to ReviewResponse[] format
      const reviews: ReviewResponse[] = [];
      Object.entries(reviewsOfOurWork).forEach(([roundKey, reviewsArray]: any) => {
        // reviewsArray is expected to be an array of review objects per questionnaire
        if (Array.isArray(reviewsArray)) {
          // Flatten nested arrays if present (e.g., [[review1, review2], ...])
          const flatReviews = reviewsArray.flat();
          const groupedByReviewer = new Map<string, any>();

          flatReviews.forEach((review: any) => {
            const reviewerName = review.reviewer_name || `Reviewer ${review.id}`;
            if (!groupedByReviewer.has(reviewerName)) {
              groupedByReviewer.set(reviewerName, {
                reviewerId: String(review.id),
                reviewerName,
                responses: {},
              });
            }
            const reviewerGroup = groupedByReviewer.get(reviewerName)!;
            reviewerGroup.responses[review.item_id || review.id] = {
              score: review.answer !== undefined ? review.answer : undefined,
              comment: review.comments || undefined,
            };
          });

          groupedByReviewer.forEach((reviewerData) => {
            reviews.push({
              reviewerId: reviewerData.reviewerId,
              reviewerName: reviewerData.reviewerName,
              roundNumber: reviews.length + 1,
              submissionTime: undefined,
              responses: reviewerData.responses,
            });
          });
        }
      });

      console.log('ReviewTableau: extracted reviews count', { reviewsCount: reviews.length });

      const rounds: ReviewRound[] = rubrics.map((r, idx) => ({
        roundNumber: idx + 1,
        roundName: `Review Round ${idx + 1}`,
        rubricId: r.id,
        reviews: reviews.length > 0 ? reviews : [],
      }));

      const apiData: ReviewTableauData = {
        studentId: resp?.participant?.handle ? String(resp.participant.handle) : String(resp?.participant?.id ?? studentId),
        course: resp?.assignment?.course || '',
        assignment: resp?.assignment?.name ?? '',
        rubrics,
        rounds,
        assignmentId: assignmentId ?? resp?.assignment?.id,
        participantId: participantId ?? resp?.participant?.id,
      };

      setData(apiData);
      console.log('ReviewTableau: state set with apiData', { studentId: apiData.studentId, rubrics: apiData.rubrics.length, rounds: apiData.rounds.length });
    } catch (err) {
      console.error('ReviewTableau: error mapping apiResponse', err);
    }
  }, [apiResponse, studentId, assignmentId, participantId]);

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

    // Add reviewer columns for this specific round
    round.reviews.forEach((review, index) => {
      columns.push({
        id: `reviewer_${index}`,
        header: () => (
          <div className="reviewer-header-content">
            <div className="reviewer-name">{review.reviewerName}</div>
            <div className="submission-time">{review.submissionTime || `Round ${review.roundNumber}`}</div>
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
    
    if (item.itemType === 'Criterion' && response.score !== undefined) {
      if (item.maxScore) {
        return <ScoreWidget score={response.score} maxScore={item.maxScore} comment={response.comment} hasComment={!!response.comment} />;
      }
    }
    
    if (item.itemType === 'Checkbox' && response.checkValue !== undefined) {
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
    
    if (item.itemType === 'TextArea' && response.textResponse !== undefined) {
      return (
        <div className="text-response-cell">
          {response.textResponse || '—'}
        </div>
      );
    }
    
    return <span className="no-response">—</span>;
  };

  if (apiLoading) {
    return (
      <div className="review-tableau-loading">
        <div className="loading-spinner">Loading review tableau...</div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="review-tableau-error">
        <div className="error-message">{apiError}</div>
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
      <h2 className="main-title">Review By Student, {data.studentId}</h2>
      
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
                <h2 className="rubric-title">{rubricRound.rubric.name}</h2>
                
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
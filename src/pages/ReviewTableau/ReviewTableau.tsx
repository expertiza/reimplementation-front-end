import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { ReviewTableauData, ReviewRound, RubricItem, ReviewResponse, Rubric } from '../../types/reviewTableau';
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get parameters from URL
  const studentId = searchParams.get('studentId') || '10836';
  const assignmentId = searchParams.get('assignmentId');
  const participantId = searchParams.get('participantId');

  useEffect(() => {
    const loadReviewTableauData = async () => {
      try {
        setLoading(true);
        
        // Mock data with multiple rubrics and rounds
        const mockData: ReviewTableauData = {
          studentId: studentId,
          course: 'CSC/ECE 517, Spring 2025',
          assignment: 'Program 2',
          rubrics: [
            {
              id: 'rubric1',
              name: 'Functionality & Design Rubric',
              items: [
                {
                  id: '1',
                  txt: 'All necessary attributes are present for the admin.',
                  itemType: 'Criterion',
                  maxScore: 5
                },
                {
                  id: '2', 
                  txt: 'All necessary attributes are present for the user.',
                  itemType: 'Criterion',
                  maxScore: 5
                },
                {
                  id: '3',
                  txt: 'All necessary attributes are present for the show.',
                  itemType: 'Criterion', 
                  maxScore: 5
                },
                {
                  id: '4',
                  txt: 'All necessary attributes are present for the movie.',
                  itemType: 'Criterion',
                  maxScore: 5
                },
                {
                  id: '5',
                  txt: 'All necessary attributes are present for the ticket.',
                  itemType: 'Criterion',
                  maxScore: 5
                },
                {
                  id: '6',
                  txt: 'A user can sign up for a new account',
                  itemType: 'Checkbox'
                },
                {
                  id: '7',
                  txt: 'A user/admin can log in with a username and password.',
                  itemType: 'Checkbox'
                },
                {
                  id: '8',
                  txt: 'A user can edit and delete her/his own profile.',
                  itemType: 'Checkbox'
                },
                {
                  id: '9',
                  txt: 'A user/admin can view all the movies available on the website.',
                  itemType: 'Checkbox'
                },
                {
                  id: '10',
                  txt: 'A user/admin can view all the shows for a movie available on the website.',
                  itemType: 'Checkbox'
                },
                {
                  id: '11',
                  txt: 'A user can purchase tickets for a movie that has been released.',
                  itemType: 'Checkbox'
                },
                {
                  id: '12',
                  txt: 'A user can not purchase tickets for a movie that is not yet released.',
                  itemType: 'Checkbox'
                },
                {
                  id: '13',
                  txt: 'A user can check their own purchase history (or transaction history).',
                  itemType: 'Checkbox'
                },
                {
                  id: '14',
                  txt: 'A user can access only resources that they are allowed to, but cannot access others by simply changing the URL.',
                  itemType: 'Checkbox'
                },
                {
                  id: '15',
                  txt: 'The workflow is intuitive. Would you suggest making any changes to the workflow?',
                  itemType: 'Criterion',
                  maxScore: 5
                },
                {
                  id: '16',
                  txt: 'Overall, do you find other problem(s)? Please specify them.',
                  itemType: 'TextArea'
                },
                {
                  id: '17',
                  txt: 'Additional Comments',
                  itemType: 'TextArea'
                }
              ]
            },
            {
              id: 'rubric2',
              name: 'Code Quality Rubric',
              items: [
                {
                  id: '18',
                  txt: 'The code is written in a clean and readable way',
                  itemType: 'Criterion',
                  maxScore: 5
                },
                {
                  id: '19',
                  txt: 'Code follows proper naming conventions',
                  itemType: 'Criterion',
                  maxScore: 5
                },
                {
                  id: '20',
                  txt: 'Code has appropriate comments and documentation',
                  itemType: 'Criterion',
                  maxScore: 5
                }
              ]
            }
          ],
          rounds: [
            {
              roundNumber: 1,
              roundName: 'Review Round 1',
              rubricId: 'rubric1',
              reviews: [
                {
                  reviewerId: 'r1',
                  reviewerName: 'Program_2_180',
                  roundNumber: 1,
                  submissionTime: 'done at — Wed, Feb 19, 2025 08:26:44 PM',
                  responses: {
                    '1': { score: 5 },
                    '2': { score: 5 },
                    '3': { score: 5 },
                    '4': { score: 5 },
                    '5': { score: 5 },
                    '6': { checkValue: true },
                    '7': { checkValue: true },
                    '8': { checkValue: true },
                    '9': { checkValue: true },
                    '10': { checkValue: false },
                    '11': { checkValue: false },
                    '12': { checkValue: true },
                    '13': { checkValue: false },
                    '14': { checkValue: true },
                    '15': { score: 4 },
                    '16': { textResponse: 'When you click on a link — for example showings, sometimes the app will redirect the user to the login page instead of where they want to go. I also was not able to purchase or create tickets likely because remaining seats was negative.' },
                    '17': { textResponse: '' }
                  }
                },
                {
                  reviewerId: 'r2',
                  reviewerName: 'Oodd_project2',
                  roundNumber: 1,
                  submissionTime: 'done at — Wed, Feb 19, 2025 08:42:37 PM',
                  responses: {
                    '1': { score: 5 },
                    '2': { score: 5 },
                    '3': { score: 5 },
                    '4': { score: 0 },
                    '5': { score: 5 },
                    '6': { checkValue: true },
                    '7': { checkValue: true },
                    '8': { checkValue: true },
                    '9': { checkValue: true },
                    '10': { checkValue: true },
                    '11': { checkValue: true },
                    '12': { checkValue: true },
                    '13': { checkValue: false },
                    '14': { checkValue: false },
                    '15': { score: 0 },
                    '16': { textResponse: 'A user can see the information for all other users and there is no link to go back to home or a users profile on certain pages.' },
                    '17': { textResponse: 'Consider adding some type of message to let users know that sign up was successful. Currently, the app just redirects to login. Also, there is no button/link to return to home' }
                  }
                }
              ]
            },
            {
              roundNumber: 2,
              roundName: 'Review Round 2',
              rubricId: 'rubric2',
              reviews: [
                {
                  reviewerId: 'r3',
                  reviewerName: 'Program_2_180',
                  roundNumber: 2,
                  submissionTime: 'done at — Tue, Feb 25, 2025 11:18:04 PM',
                  responses: {
                    '18': { score: 4, comment: 'The code is well-organized and follows standard Rails conventions, with clear separation between tests, controllers, and views. The formatting and inline comments make it easy to follow the logic across different components.' },
                    '19': { score: 5, comment: 'Excellent naming conventions throughout' },
                    '20': { score: 3, comment: 'Some sections could use more documentation' }
                  }
                },
                {
                  reviewerId: 'r4',
                  reviewerName: 'Oodd_project2',
                  roundNumber: 2,
                  submissionTime: 'done at — Tue, Feb 25, 2025 11:49:10 PM',
                  responses: {
                    '18': { score: 4, comment: 'Overall, the code was written using good practices and was readable.' },
                    '19': { score: 4, comment: 'Good naming but some variables could be more descriptive' },
                    '20': { score: 4, comment: 'Adequate documentation' }
                  }
                },
                {
                  reviewerId: 'r5',
                  reviewerName: 'Coders',
                  roundNumber: 2,
                  submissionTime: 'done at — Tue, Feb 25, 2025 11:03:06 PM',
                  responses: {
                    '18': { score: 4, comment: 'The overall structure is clear and well-organized, with consistent formatting and helpful inline comments that make the code easy to follow.' },
                    '19': { score: 5, comment: 'Very clear and consistent naming' },
                    '20': { score: 5, comment: 'Well documented code' }
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
  }, [studentId, assignmentId, participantId]);

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

  // Sort rounds by round number (keeping for potential future use)
  const sortedRounds = data?.rounds ? [...data.rounds].sort((a, b) => a.roundNumber - b.roundNumber) : [];

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
          {response.checkValue ? '✓' : '✗'}
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

  // Generate table data and columns for each round
  const generateTableData = (round: ReviewRound, rubricItems: RubricItem[]) => {
    // Show all items for all rounds
    const filteredItems = rubricItems;

    return filteredItems.map(item => {
      const rowData: any = {
        id: item.id,
        item: item.txt,
        itemType: item.itemType,
        maxScore: item.maxScore
      };

      // Add response data for each reviewer
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

  // Generate columns for each round
  const generateColumns = (round: ReviewRound): ColumnDef<any>[] => {
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

    // Add reviewer columns
    round.reviews.forEach((review, index) => {
      columns.push({
        id: `reviewer_${index}`,
        header: () => (
          <div className="reviewer-header-content">
            <div className="reviewer-name">{review.reviewerName}</div>
            <div className="submission-time">{review.submissionTime}</div>
          </div>
        ),
        accessorKey: `reviewer_${index}`,
        cell: ({ row }) => {
          const reviewerData = row.original[`reviewer_${index}`];
          if (!reviewerData || !reviewerData.response) {
            return <span className="no-response">—</span>;
          }

          const item = {
            id: row.original.id,
            txt: row.original.item,
            itemType: row.original.itemType,
            maxScore: row.original.maxScore
          } as RubricItem;

          return (
            <div className="response-cell-content">
              {renderReviewCell(item, reviewerData.response)}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      });
    });

    return columns;
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
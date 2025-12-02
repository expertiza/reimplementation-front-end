import axiosClient from '../utils/axios_client';
import { ReviewTableauData } from '../types/reviewTableau';

/**
 * Service for grades-related API calls
 */

export interface GetReviewTableauDataParams {
  assignmentId: string;
  participantId: string;
}

export interface ReviewTableauApiResponse {
  responses_by_round: {
    [roundId: string]: {
      [itemId: string]: {
        description: string;
        answers: {
          values: number[];
          comments: string[];
        };
      };
    };
  };
  participant: {
    id: number;
    user_id: number;
    user_name: string;
    full_name: string;
    handle: string;
  };
  assignment: {
    id: number;
    name: string;
  };
}

/**
 * Fetch review tableau data for a specific assignment and participant
 */
export const getReviewTableauData = async (params: GetReviewTableauDataParams): Promise<ReviewTableauApiResponse> => {
  const { assignmentId, participantId } = params;
  const response = await axiosClient.get(`/grades/${assignmentId}/${participantId}/get_review_tableau_data`);
  return response.data;
};

/**
 * Transform API response to frontend data structure
 */
export const transformReviewTableauData = (apiData: ReviewTableauApiResponse, studentId?: string): ReviewTableauData => {
  const { responses_by_round, participant, assignment } = apiData;
  
  // Transform the API response structure to match the frontend types
  const rubrics: any[] = [];
  const rounds: any[] = [];
  
  // Group data by rounds
  Object.entries(responses_by_round).forEach(([roundId, roundData]) => {
    const roundNumber = parseInt(roundId) || 1;
    
    // Create rubric items from the round data
    const items = Object.entries(roundData).map(([itemId, itemData], index) => ({
      id: itemId,
      txt: itemData.description,
      itemType: 'Criterion',
      maxScore: 5, // Default max score, could be dynamic
    }));
    
    // Create rubric for this round
    const rubric = {
      id: `rubric_${roundId}`,
      name: `Review Rubric - Round ${roundNumber}`,
      items,
    };
    
    rubrics.push(rubric);
    
    // Create reviews for this round
    const reviews: any[] = [];
    const maxResponses = Math.max(
      ...Object.values(roundData).map(item => item.answers.values.length)
    );
    
    // Create one review per response (assuming each index represents a different reviewer)
    for (let reviewerIndex = 0; reviewerIndex < maxResponses; reviewerIndex++) {
      const responses: any = {};
      
      Object.entries(roundData).forEach(([itemId, itemData]) => {
        if (itemData.answers.values[reviewerIndex] !== undefined) {
          responses[itemId] = {
            score: itemData.answers.values[reviewerIndex],
            comment: itemData.answers.comments[reviewerIndex] || '',
          };
        }
      });
      
      reviews.push({
        reviewerId: `reviewer_${reviewerIndex + 1}`,
        reviewerName: `Reviewer ${reviewerIndex + 1}`,
        roundNumber,
        submissionTime: undefined,
        responses,
      });
    }
    
    // Create round
    rounds.push({
      roundNumber,
      roundName: `Review Round ${roundNumber}`,
      rubricId: rubric.id,
      reviews,
    });
  });
  
  return {
    studentId: apiData.participant.user_name || apiData.participant.full_name || `Student ${apiData.participant.id}`,
    course: 'Course Information', // This might need to be fetched separately
    assignment: apiData.assignment.name || 'Assignment Information',
    rubrics,
    rounds,
    assignmentId: apiData.assignment.id.toString(),
    participantId: apiData.participant.id.toString(),
  };
};

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
      min_answer_value: number;
      max_answer_value: number;
      items: {
        [itemId: string]: {
          description: string;
          question_type: string;
          answers: {
            values: number[];
            comments: string[];
          };
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
 * The API returns all reviews completed BY the given participant (reviewer) for the assignment
 */
export const transformReviewTableauData = (apiData: ReviewTableauApiResponse, reviewerId?: string): ReviewTableauData => {
  const { responses_by_round, participant, assignment } = apiData;
  
  // Transform the API response structure to match the frontend types
  const rubrics: any[] = [];
  const rounds: any[] = [];
  
  // Group data by rounds
  Object.entries(responses_by_round).forEach(([roundId, roundData]) => {
    const roundNumber = parseInt(roundId) || 1;
    
    // Extract rubric metadata
    const { min_answer_value, max_answer_value, items } = roundData;
    
    // Create rubric items from the round data
    const rubricItems = Object.entries(items).map(([itemId, itemData]) => ({
      id: itemId,
      txt: itemData.description,
      itemType: itemData.question_type || 'Criterion',
      questionType: itemData.question_type,
      maxScore: max_answer_value || 5, // Use the actual max value from the rubric
      minScore: min_answer_value || 1, // Store min value as well
    }));
    
    // Create rubric for this round
    const rubric = {
      id: `rubric_${roundId}`,
      name: `Review Rubric - Round ${roundNumber}`,
      items: rubricItems,
      maxScore: max_answer_value || 5,
      minScore: min_answer_value || 1,
    };
    
    rubrics.push(rubric);
    
    // Create reviews for this round
    const reviews: any[] = [];
    const maxResponses = Math.max(
      ...Object.values(items).map(item => item.answers.values.length)
    );
    
    // Create one review per response (each index represents a different team/student reviewed by THIS reviewer)
    for (let reviewIndex = 0; reviewIndex < maxResponses; reviewIndex++) {
      const responses: any = {};
      
      Object.entries(items).forEach(([itemId, itemData]) => {
        if (itemData.answers.values[reviewIndex] !== undefined) {
          responses[itemId] = {
            score: itemData.answers.values[reviewIndex],
            comment: itemData.answers.comments[reviewIndex] || '',
          };
        }
      });
      
      reviews.push({
        reviewerId: `review_${reviewIndex + 1}`,
        reviewerName: `Team ${reviewIndex + 1}`, // We'll improve this later with actual team names
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
    studentId: reviewerId || apiData.participant.user_name || apiData.participant.full_name || `Reviewer ${apiData.participant.id}`,
    course: 'Course Information', // This might need to be fetched separately
    assignment: apiData.assignment.name || 'Assignment Information',
    rubrics,
    rounds,
    assignmentId: apiData.assignment.id.toString(),
    participantId: apiData.participant.id.toString(),
  };
};

import { useState, useEffect, useCallback } from 'react';
import { SignUpTopic, SignedUpTeam, TopicWithTeams, IAssignmentResponse } from '../utils/interfaces';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api/v1';

export const useSignupSheet = (assignmentId: string) => {
  const [topics, setTopics] = useState<TopicWithTeams[]>([]);
  const [assignment, setAssignment] = useState<IAssignmentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignupData = useCallback(async () => {
    if (!assignmentId) {
      setError('Assignment ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch assignment details
      const assignmentResponse = await axios.get<IAssignmentResponse>(
        `${API_BASE_URL}/assignments/${assignmentId}`,
        { headers }
      );
      setAssignment(assignmentResponse.data);

      // Fetch sign up topics for the assignment
      const topicsResponse = await axios.get<SignUpTopic[]>(
        `${API_BASE_URL}/sign_up_topics`,
        {
          params: { assignment_id: assignmentId },
          headers,
        }
      );

      const signUpTopics = topicsResponse.data;

      // Fetch signed up teams for all topics
      const signedUpTeamsResponse = await axios.get<SignedUpTeam[]>(
        `${API_BASE_URL}/signed_up_teams`,
        {
          params: { assignment_id: assignmentId },
          headers,
        }
      );

      const signedUpTeams = signedUpTeamsResponse.data;

      // Group signed up teams by topic
      const topicsWithTeams: TopicWithTeams[] = signUpTopics.map((topic) => {
        const teamsForTopic = signedUpTeams.filter(
          (team) => team.sign_up_topic_id === topic.id
        );

        const regularTeams = teamsForTopic.filter((team) => !team.is_waitlisted);
        const waitlistedTeams = teamsForTopic.filter((team) => team.is_waitlisted);

        const availableSlots = Math.max(0, topic.max_choosers - regularTeams.length);

        return {
          topic,
          signedUpTeams: teamsForTopic,
          availableSlots,
          waitlistCount: waitlistedTeams.length,
        };
      });

      setTopics(topicsWithTeams);
    } catch (err: any) {
      console.error('Error fetching signup sheet data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch signup sheet data'
      );
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchSignupData();
  }, [fetchSignupData]);

  const refresh = useCallback(() => {
    fetchSignupData();
  }, [fetchSignupData]);

  return {
    topics,
    assignment,
    loading,
    error,
    refresh,
  };
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReviewMapping, TopicWithReviewers } from '../utils/interfaces';
import dummyTopicData from '../pages/Assignments/Data/DummyTopics.json';

// Define the shape of the context data and functions
type ReviewerContextType = {
    topics: TopicWithReviewers[]; 
    addReviewerToTopic: (topicIdentifier: string, reviewer: ReviewMapping) => void; // framework to associate reviewer with topic
};

// Create a context with an initial value of `undefined` 
const ReviewerContext = createContext<ReviewerContextType | undefined>(undefined);

// Transform function: raw JSON → structured interface (make JSON compatible with interfaces)
const transformDummyData = (): TopicWithReviewers[] => {
    return dummyTopicData.map((t, index) => ({
        topic_identifier: `E${index + 2450}`,
        topic_name: t.topic,
        contributors: t.contributors.map((c, i) => ({
            id: i,
            name: c.name,
            type: 'AssignmentParticipant ',
            users: [],
            reviewMappings: [],
        })),
        reviewers: t.reviewers.map((r, i) => ({
            map_id: i,
            reviewer: {
                name: r.name,
                username: r.username,
                full_name: r.name,
                email: '',
                role_id: 0,
                institution_id: 0,
            },
            review_status: r.status as 'Pending' | 'Saved' | 'Submitted',
            metareview_mappings: [],
        })),
    }));
};

const LOCAL_STORAGE_KEY = 'reviewerData'; 

// pull initial context from local storage and then DummyTopics.json file
export const ReviewerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [topics, setTopics] = useState<TopicWithReviewers[]>(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : transformDummyData();
    }); 

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(topics));
    }, [topics]);

  // Add reviewer to a specific topic
    function addReviewerToTopic(topicIdentifier: string, reviewer: ReviewMapping) {
      // update state if there are less than 3 reviewers for a specific topic
        setTopics(prev =>
            prev.map(topic =>
                topic.topic_identifier === topicIdentifier && topic.reviewers.length < 3
            ? { ...topic, reviewers: [...topic.reviewers, reviewer] } 
            : topic
        )
        );
    }
    // Provide the context values (topics and the function to add a reviewer) to children
  return (
    <ReviewerContext.Provider value={{ topics, addReviewerToTopic }}>
      {children}
    </ReviewerContext.Provider>
  );
};

// Custom hook to use the ReviewerContext in components
export const useReviewerContext = (): ReviewerContextType => {
    const context = useContext(ReviewerContext);
    // Throw an error if the hook is used outside the ReviewerProvider
  if (!context) {
    throw new Error('useReviewerContext must be used within a ReviewerProvider');
  }
  return context;
};

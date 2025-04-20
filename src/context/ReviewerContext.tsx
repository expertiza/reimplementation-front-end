import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Contributor, ReviewMapping } from '../utils/interfaces';


// add interfaces that build off of the ones found in interface file
interface ReviewerContextType {
  topics: TopicWithContributors[];
  addReviewerToTopic: (topicTitle: string, reviewer: ReviewMapping) => void;
}

interface TopicWithContributors {
  topic: string;
  contributors: Contributor[];
  reviewers: ReviewMapping[];
}

const ReviewerContext = createContext<ReviewerContextType | undefined>(undefined);

// pull context from DummyTopics.json file
export const ReviewerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [topics, setTopics] = useState<TopicWithContributors[]>(
    require('../pages/assignment/Data/DummyTopics.json')
  );

  // add Reviewer to topic when directed
  const addReviewerToTopic = (topicTitle: string, reviewer: ReviewMapping) => {
    setTopics(prev =>
      prev.map(topic =>
        topic.topic === topicTitle && topic.reviewers.length < 3
          ? { ...topic, reviewers: [...topic.reviewers, reviewer] }
          : topic
      )
    );
  };

  return (
    <ReviewerContext.Provider value={{ topics, addReviewerToTopic }}>
      {children}
    </ReviewerContext.Provider>
  );
};

//export Context, include error handling if unsuccessful 
export const useReviewerContext = (): ReviewerContextType => {
  const context = useContext(ReviewerContext);
  if (!context) {
    throw new Error('useReviewerContext must be used within a ReviewerProvider');
  }
  return context;
};

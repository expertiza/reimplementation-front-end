// src/pages/TeammateReview/data/dummyData.ts

export interface Review {
    name: string;
    score: number;
    comment?: string;
  }
  
  export interface ReviewData {
    questionNumber: string;
    questionText: string;
    reviews: Review[];
    RowAvg: number;
    maxScore: number;
  }
  

  const reviewsGivenRound1: ReviewData[] = [
    {
      questionNumber: "1",
      questionText: "How many times was this person late to meetings?",
      reviews: [
        { name: "Alice Johnson", score: 5, comment: "Always punctual" },
        { name: "Bob Smith", score: 4, comment: "Usually on time" },
        { name: "Carol Davis", score: 5, comment: "Never late" }
      ],
      RowAvg: 4.67,
      maxScore: 5
    },
    {
      questionNumber: "2",
      questionText: "How much did this person contribute to the project?",
      reviews: [
        { name: "Alice Johnson", score: 5, comment: "Excellent contributions" },
        { name: "Bob Smith", score: 4, comment: "Good work overall" },
        { name: "Carol Davis", score: 5, comment: "Very dedicated" }
      ],
      RowAvg: 4.67,
      maxScore: 5
    },
    {
      questionNumber: "3",
      questionText: "Did this person complete assigned tasks?",
      reviews: [
        { name: "Alice Johnson", score: 1, comment: "Yes" },
        { name: "Bob Smith", score: 1, comment: "Yes" },
        { name: "Carol Davis", score: 1, comment: "Yes" }
      ],
      RowAvg: 1,
      maxScore: 1
    }
  ];
  

  const reviewsGivenRound2: ReviewData[] = [
    {
      questionNumber: "1",
      questionText: "How many times was this person late to meetings?",
      reviews: [
        { name: "Alice Johnson", score: 4, comment: "Improved punctuality" },
        { name: "Bob Smith", score: 5, comment: "Much better this round" },
        { name: "Carol Davis", score: 5, comment: "Consistently on time" }
      ],
      RowAvg: 4.67,
      maxScore: 5
    },
    {
      questionNumber: "2",
      questionText: "How much did this person contribute to the project?",
      reviews: [
        { name: "Alice Johnson", score: 5, comment: "Outstanding work" },
        { name: "Bob Smith", score: 5, comment: "Significant improvement" },
        { name: "Carol Davis", score: 4, comment: "Good consistent effort" }
      ],
      RowAvg: 4.67,
      maxScore: 5
    },
    {
      questionNumber: "3",
      questionText: "Did this person complete assigned tasks?",
      reviews: [
        { name: "Alice Johnson", score: 1, comment: "Yes" },
        { name: "Bob Smith", score: 1, comment: "Yes" },
        { name: "Carol Davis", score: 1, comment: "Yes" }
      ],
      RowAvg: 1,
      maxScore: 1
    }
  ];
  
 
  const reviewsReceivedRound1: ReviewData[] = [
    {
      questionNumber: "1",
      questionText: "How many times was this person late to meetings?",
      reviews: [
        { name: "Alice Johnson", score: 5, comment: "Always on time" },
        { name: "Bob Smith", score: 5, comment: "Very punctual" },
        { name: "Carol Davis", score: 4, comment: "Good attendance" }
      ],
      RowAvg: 4.67,
      maxScore: 5
    },
    {
      questionNumber: "2",
      questionText: "How much did this person contribute to the project?",
      reviews: [
        { name: "Alice Johnson", score: 4, comment: "Good contributions" },
        { name: "Bob Smith", score: 5, comment: "Excellent work" },
        { name: "Carol Davis", score: 5, comment: "Very helpful" }
      ],
      RowAvg: 4.67,
      maxScore: 5
    },
    {
      questionNumber: "3",
      questionText: "Did this person complete assigned tasks?",
      reviews: [
        { name: "Alice Johnson", score: 1, comment: "Yes" },
        { name: "Bob Smith", score: 1, comment: "Yes" },
        { name: "Carol Davis", score: 1, comment: "Yes" }
      ],
      RowAvg: 1,
      maxScore: 1
    }
  ];
  
 
  const reviewsReceivedRound2: ReviewData[] = [
    {
      questionNumber: "1",
      questionText: "How many times was this person late to meetings?",
      reviews: [
        { name: "Alice Johnson", score: 5, comment: "Maintained perfect attendance" },
        { name: "Bob Smith", score: 5, comment: "Always punctual" },
        { name: "Carol Davis", score: 5, comment: "Great time management" }
      ],
      RowAvg: 5,
      maxScore: 5
    },
    {
      questionNumber: "2",
      questionText: "How much did this person contribute to the project?",
      reviews: [
        { name: "Alice Johnson", score: 5, comment: "Exceptional improvement" },
        { name: "Bob Smith", score: 5, comment: "Outstanding leadership" },
        { name: "Carol Davis", score: 5, comment: "Key contributor" }
      ],
      RowAvg: 5,
      maxScore: 5
    },
    {
      questionNumber: "3",
      questionText: "Did this person complete assigned tasks?",
      reviews: [
        { name: "Alice Johnson", score: 1, comment: "Yes" },
        { name: "Bob Smith", score: 1, comment: "Yes" },
        { name: "Carol Davis", score: 1, comment: "Yes" }
      ],
      RowAvg: 1,
      maxScore: 1
    }
  ];
  
  export const reviewsGiven = [reviewsGivenRound1, reviewsGivenRound2];
  export const reviewsReceived = [reviewsReceivedRound1, reviewsReceivedRound2];
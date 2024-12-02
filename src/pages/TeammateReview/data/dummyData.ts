// src/pages/TeammateReview/data/dummyData.ts

export interface Review {
    questionNumber: string;
    questionText: string;
    reviews: {
      name: string;
      score: number;
      comment?: string;
    }[];
    RowAvg: number;
    maxScore: number;
  }
  
  // 当前用户给出的评审
  export const reviewsGiven: Review[][] = [[
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
    }
  ]];
  
  // 当前用户收到的评审
  export const reviewsReceived: Review[][] = [[
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
    }
  ]];
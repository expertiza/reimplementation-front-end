import React from "react";

interface Question {
  id: number;
  txt: string;
  question_type: string;
}

interface ShowReviewsProps {
  questions: Question[];
  summary: Record<string, Record<string, string[]>>;
  roundSelected: number;
}

const ShowReviews: React.FC<ShowReviewsProps> = ({ questions, summary, roundSelected }) => {
  const participantId = "1"; // Assuming participant ID is 1 for now
  const participantSummary = summary[participantId] || {};

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Reviews</h2>

      {questions.length === 0 ? (
        <p>No review questions available.</p>
      ) : (
        questions.map((question: Question, questionIndex: number) => (
          <div className="review-block" key={question.id}>
            <div className="question">
              {questionIndex + 1}. {question.txt}
            </div>

            <div className="score-container">
            {(participantSummary[question.txt] || []).length > 0 ? (
              participantSummary[question.txt].map((comment: any, i: any) => (
                <div key={i} className="mb-2">
                  <div className="comment text-gray-600">{comment}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No reviews for this question</div>
            )}
          </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ShowReviews;
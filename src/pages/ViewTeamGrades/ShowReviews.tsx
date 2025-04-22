import React, { useState, useEffect } from "react";

interface Question {
  id: number;
  txt: string;
  question_type: string;
}

interface ShowReviewsProps {
  questions: Question[];
  summary: any;
  roundSelected: number;
  avg_scores_by_criterion: any; // new
}

const getBubbleColorHex = (score: number) => {
  if (score >= 4.5) return "#2f855a"; // Dark green
  if (score >= 3.5) return "#48bb78"; // Green
  if (score >= 2.5) return "#ecc94b"; // Yellow
  if (score >= 1.5) return "#ed8936"; // Orange
  return "#f56565";                  // Red
};



const ShowReviews: React.FC<ShowReviewsProps> = ({
  questions,
  summary,
  roundSelected,
  avg_scores_by_criterion,
}) => {
  const [reviewScores, setReviewScores] = useState<any>({});

  useEffect(() => {
    // Map question text -> scaled score
    const scoresMap: any = {};
    if (avg_scores_by_criterion?.["1"]) {
      Object.keys(avg_scores_by_criterion["1"]).forEach((questionText) => {
        const rawScore = avg_scores_by_criterion["1"][questionText];
        scoresMap[questionText] = rawScore / 100; // Proper scaling to 5
      });
    }
    setReviewScores(scoresMap);
  }, [avg_scores_by_criterion]);

  if (!questions.length) return <div>No questions available.</div>;

  const participantId = "1"; // assuming participant 1
  const participantSummary = summary[participantId] || {};

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Reviews</h2>

      {questions.map((question, questionIndex) => (
        <div
          key={question.id}
          className={`review-block mb-6 p-4 ${
            questionIndex % 2 === 0 ? "bg-blue-100" : "bg-yellow-100"
          } rounded-lg`}
        >
          <div className="question font-semibold text-lg mb-2">
            {questionIndex + 1}. {question.txt}
          </div>

          <div className="mt-2">
            {(participantSummary[question.txt] || []).map((comment: any, i: number) => (
              <div key={i} className="flex items-center space-x-4 mt-2">
                {/* Bubble for score */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: getBubbleColorHex(typeof reviewScores[question.txt] == "number" ? reviewScores[question.txt] : 0),
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "50%",
                    fontWeight: "bold",
                    fontSize: "14px",
                    minWidth: "32px",
                    height: "32px",
                    textAlign: "center",
                  }}
                >
                  {reviewScores[question.txt] ?? "N/A"}
                </div>

                {/* Review comment */}
                <div className="text-gray-700">{comment}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShowReviews;
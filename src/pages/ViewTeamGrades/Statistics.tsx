import { useState, useEffect } from 'react';
import { calculateAverages, toggleVisibility } from './utils';
import './grades.scss';
import CircularProgress from './CircularProgress';
import ShowReviews from './ShowReviews';
import dummyDataRounds from './Data/heatMapData.json';
import dummyAuthorFeedback from './Data/authorFeedback.json';
import BarGraph from './BarGraph';
import teammateData from './Data/teammateData.json';
import AverageMarks from './teamMarks';

interface StatisticsProps {
  average: string;
}

// Reusable toggle button component
const ToggleButton: React.FC<{ isVisible: boolean; onClick: () => void; showText: string; hideText: string }> = ({
  isVisible,
  onClick,
  showText,
  hideText,
}) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className="link-button"
  >
    {isVisible ? hideText : showText}
  </button>
);

const Statistics: React.FC<StatisticsProps> = ({ average }) => {
  const [sortedData, setSortedData] = useState<number[]>([]);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  const [showReviews, setShowReviews] = useState<boolean>(false);
  const [showAuthorFeedback, setShowAuthorFeedback] = useState<boolean>(false);

  useEffect(() => {
    const { sortedData } = calculateAverages(dummyDataRounds[0], 'asc');
    setSortedData(sortedData.map((item) => item.RowAvg));
  }, []);

  const getTotalReviewsForQuestion = (data: any[], questionNumber: string) =>
    data.reduce(
      (total, round) =>
        total +
        round.reduce(
          (count: number, question: any) =>
            question.questionNumber === questionNumber ? count + question.reviews.length : count,
          0
        ),
      0
    );

  const totalReviewsForQuestion1 = getTotalReviewsForQuestion(dummyDataRounds, '1');
  const totalFeedbackForQuestion1 = getTotalReviewsForQuestion(dummyAuthorFeedback, '1');

  return (
    <div className="statistics-container mx-auto p-4">
      <div className="overflow-x-auto max-w-full">
        <table className="w-full border-collapse">
          <thead>
            {/* Toggle button for showing/hiding statistics */}
            <ToggleButton
              isVisible={showStatistics}
              onClick={() => toggleVisibility(setShowStatistics)}
              showText="Show Stats"
              hideText="Hide Stats"
            />
            {showStatistics && (
              <tr>
                <th className="header-cell">Stats</th>
                <th colSpan={2}>
                  <BarGraph sortedData={sortedData} />
                </th>
                {teammateData.length > 0 && <th colSpan={2}></th>}
                <th>
                  <CircularProgress size={70} progress={75} strokeWidth={10} />
                </th>
              </tr>
            )}
            {/* Column headers */}
            <tr>
              <th className="header-cell"></th>
              <th colSpan={2}>Submitted Work</th>
              {dummyAuthorFeedback[0].length > 0 && <th colSpan={2}>Author Feedback</th>}
              {teammateData.length > 0 && <th colSpan={2}>Teammate Review</th>}
            </tr>
            {/* Subheaders */}
            <tr>
              <th className="subheader-cell">Contributor</th>
              <th className="subheader-cell">Average</th>
              <th className="subheader-cell">Range</th>
              {dummyAuthorFeedback[0].length > 0 && <th className="subheader-cell">Average</th>}
              {dummyAuthorFeedback[0].length > 0 && <th className="subheader-cell">Range</th>}
              {teammateData.length > 0 && <th className="subheader-cell">Average</th>}
              {teammateData.length > 0 && <th className="subheader-cell">Range</th>}
              <th className="subheader-cell">Final Score</th>
            </tr>
            {/* Contributor Row */}
            <tr>
              <td className="subheader-cell">
                <div className="center-text">
                  <a href="#">ssshah26</a> <span>(Siddharth Shah)</span>
                </div>
              </td>
              <td className="subheader-cell">
                <div className="center-text">
                  <div>{average}</div>
                  <ToggleButton
                    isVisible={showReviews}
                    onClick={() => toggleVisibility(setShowReviews)}
                    showText="Show Reviews"
                    hideText="Hide Reviews"
                  />
                  <span>({totalReviewsForQuestion1})</span>
                </div>
              </td>
              <td className="subheader-cell">
                <div className="center-text">99.99% - 100%</div>
              </td>
              {dummyAuthorFeedback[0].length > 0 && (
                <>
                  <td className="subheader-cell">
                    <div className="center-text">
                      96.67
                      <ToggleButton
                        isVisible={showAuthorFeedback}
                        onClick={() => toggleVisibility(setShowAuthorFeedback)}
                        showText="Show Author Feedback"
                        hideText="Hide Author Feedback"
                      />
                      <span>({totalFeedbackForQuestion1})</span>
                    </div>
                  </td>
                  <td className="subheader-cell">87% - 100%</td>
                </>
              )}
              {teammateData.length > 0 && (
                <>
                  <td className="subheader-cell">
                    <AverageMarks data={teammateData} />
                  </td>
                  <td className="subheader-cell">90% - 100%</td>
                  <td className="subheader-cell">
                    <div className="center-text">
                      75%
                      <div>(in Finished)</div>
                    </div>
                  </td>
                </>
              )}
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      {/* Conditionally render reviews and author feedback sections */}
      {showReviews && (
        <div>
          <h2>Reviews</h2>
          <ShowReviews data={dummyDataRounds} />
        </div>
      )}
      {showAuthorFeedback && (
        <div>
          <h2>Author Feedback</h2>
          <ShowReviews data={dummyAuthorFeedback} />
        </div>
      )}
    </div>
  );
};

export default Statistics;

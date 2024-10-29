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

const Statistics: React.FC<StatisticsProps> = ({ average }) => {
  const [sortedData, setSortedData] = useState<number[]>([]);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  const [showReviews, setShowReviews] = useState<boolean>(false);
  const [showAuthorFeedback, setShowAuthorFeedback] = useState<boolean>(false);

  useEffect(() => {
    const { sortedData } = calculateAverages(dummyDataRounds[0], "asc");
    setSortedData(sortedData.map(item => item.RowAvg));
  }, []);

  const getTotalReviewsForQuestion = (data: any[], questionNumber: string) =>
    data.reduce((total, round) =>
      total + round.reduce((count: number, question: any) =>
        question.questionNumber === questionNumber ? count + question.reviews.length : count, 0), 0
    );

  const totalReviewsForQuestion1 = getTotalReviewsForQuestion(dummyDataRounds, "1");
  const totalFeedbackForQuestion1 = getTotalReviewsForQuestion(dummyAuthorFeedback, "1");

  const headerCellStyle: React.CSSProperties = {
    padding: '10px',
    textAlign: 'center',
  };

  const subHeaderCellStyle: React.CSSProperties = {
    padding: '10px',
    textAlign: 'center',
  };

  return (
    <div className="mx-auto p-4">
      <div className="overflow-x-auto max-w-full">
        <table className="w-full border-collapse">
          <thead>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleVisibility(setShowStatistics);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showStatistics ? 'Hide Stats' : 'Show Stats'}
            </button>
            {showStatistics && (
              <tr>
                <th style={headerCellStyle}>Stats</th>
                <th style={headerCellStyle} colSpan={2}><BarGraph sortedData={sortedData} /></th>
                <th style={headerCellStyle} colSpan={2}></th>
                {teammateData.length !== 0 && (
                  <th style={headerCellStyle} colSpan={2}></th>
                )}

                <th style={headerCellStyle}><CircularProgress size={70} progress={75} strokeWidth={10} /></th>
              </tr>
            )}
            <tr>
              <th style={headerCellStyle}></th>
              <th style={headerCellStyle} colSpan={2}>Submitted Work</th>
              {dummyAuthorFeedback[0].length !== 0 && (
                <th style={headerCellStyle} colSpan={2}>Author Feedback</th>
              )}
              {teammateData.length !== 0 && (
                <th style={headerCellStyle} colSpan={2}>Teammate Review</th>
              )}

            </tr>
            <tr>
              <th style={subHeaderCellStyle}>Contributor</th>
              <th style={subHeaderCellStyle}>Average</th>
              <th style={subHeaderCellStyle}>Range</th>
              {dummyAuthorFeedback[0].length !== 0 && (
                <th style={subHeaderCellStyle}>Average</th>
              )}
              {dummyAuthorFeedback[0].length !== 0 && (
                <th style={subHeaderCellStyle}>Range</th>
              )}
              {teammateData.length !== 0 && (
                <th style={subHeaderCellStyle}>Average</th>
              )}
              {teammateData.length !== 0 && (
                <th style={subHeaderCellStyle}>Range</th>
              )}
              <th style={subHeaderCellStyle}>Final Score</th>
            </tr>
            <tr>
              <td style={subHeaderCellStyle}>
                <div style={{ textAlign: 'center' }}>
                  <a href="#">ssshah26 </a><span>(Siddharth Shah)</span>
                  <br />
                </div>
              </td>
              <td style={subHeaderCellStyle}>
                <div style={{ textAlign: 'center' }}>
                  <div>{average}</div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleVisibility(setShowReviews);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'blue',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showReviews ? 'Hide Reviews' : 'Show Reviews'}
                  </button>
                  <span>({totalReviewsForQuestion1})</span>
                </div>
              </td>
              <td style={subHeaderCellStyle}>
                <div style={{ textAlign: 'center' }}>
                  <div>99.99% - 100%</div>
                </div>
              </td>
              <td style={subHeaderCellStyle}>

                {dummyAuthorFeedback[0].length !== 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div>96.67</div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleVisibility(setShowAuthorFeedback);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'blue',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showAuthorFeedback ? 'Hide Author Feedback' : 'Show Author Feedback'}
                    </button>
                    <span>({totalFeedbackForQuestion1})</span>
                  </div>
                )}
                <div>
                </div>
              </td>
              <td style={subHeaderCellStyle}>
                <div style={{ textAlign: 'center' }}>
                  {dummyAuthorFeedback[0].length !== 0 && (
                    <div>87% - 100%</div>
                  )}
                </div>
              </td>
              <td style={subHeaderCellStyle}>
                <div style={{ textAlign: 'center' }}>
                  {teammateData.length !== 0 && (
                    <div><AverageMarks data={teammateData} /></div>
                  )}
                </div>
              </td>
              <td style={subHeaderCellStyle}>
                <div style={{ textAlign: 'center' }}>
                  {teammateData.length !== 0 && (
                    <div>90% - 100%</div>
                  )}
                </div>
              </td>
              <td style={subHeaderCellStyle}>
                {teammateData.length !== 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div>75%</div>
                    <div>(in Finished)</div>
                  </div>
                )}

              </td>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
      <div>
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
    </div>
  );

};

export default Statistics;

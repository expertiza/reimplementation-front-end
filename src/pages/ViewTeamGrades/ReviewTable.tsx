import { useMemo, useState } from 'react';
import ReviewTableRow from './ReviewTableRow';
import RoundSelector from './RoundSelector';
import dummyDataRounds from './Data/heatMapData.json';
import dummyData from './Data/dummyData.json';
import { calculateAverages } from './utils';
import './grades.scss';
import { Link } from 'react-router-dom';
import Statistics from './Statistics';
import { Collapse } from 'react-bootstrap';

const ReviewTable: React.FC = () => {
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [rowSortOrder, setRowSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [isQuestionListVisible, setIsQuestionListVisible] = useState(false);
  const [submissionDetailsVisible, setSubmissionDetailsVisible] = useState(false);

  const toggleRowSortOrder = () => {
    setRowSortOrder(prevSortOrder =>
      prevSortOrder === 'asc' ? 'desc'
        : prevSortOrder === 'desc' ? 'none'
          : 'asc'
    );
  };

  const selectedRoundData = useMemo(() => dummyDataRounds[selectedRound], [selectedRound]);

  const { averagePeerReviewScore, columnAverages, sortedData } = useMemo(
    () => calculateAverages(selectedRoundData, rowSortOrder),
    [selectedRoundData, rowSortOrder]
  );

  const handleRoundChange = (roundIndex: number) => {
    setSelectedRound(roundIndex);
  };

  const toggleQuestionVisibility = () => {
    setIsQuestionListVisible(!isQuestionListVisible);
  };

  const toggleSubmissionDetailsVisibility = () => {
    setSubmissionDetailsVisible(!submissionDetailsVisible);
  };

  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Summary Report: Program 2</h2>
      <h3 className="text-xl font-semibold mb-1">Team: {dummyData.team}</h3>
      <h5 className="mb-4">Average peer review score: <span>{averagePeerReviewScore}</span></h5>

      <div>Tagging: 97/97</div>
      <div className="mt-4 space-y-6">
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            toggleSubmissionDetailsVisibility();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            padding: '0',
            textDecoration: 'underline'
          }}
        >
          {submissionDetailsVisible ? 'Hide Submission Details' : 'Show Submission Details'}
        </button>
        <Collapse in={submissionDetailsVisible}>
          <div className="flex flex-col mb-4">
            <br />
            {submissionDetailsVisible && (
              <>
                <a
                  href="https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents
                </a>
                <br />
                <a
                  href="http://152.7.177.44:8080/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  http://152.7.177.44:8080/
                </a>
                <br />
                {/* Add a downloadable link to your dummy file */}
                <a
                  href="https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents/raw/main/README.md"
                  download="README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  README.md
                </a>
              </>
            )}
          </div>
        </Collapse>
      </div>

      {/* Review Section */}
      <h3 className="text-lg font-medium mb-2">
        Review (Round: {selectedRound + 1} of {dummyDataRounds.length})
      </h3>
      <br />
      <form className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="toggleQuestion"
          name="toggleQuestion"
          checked={isQuestionListVisible}
          onChange={toggleQuestionVisibility}
        />
        <label htmlFor="toggleQuestion"> &nbsp;Toggle Question List</label>
      </form>
      <div className="overflow-x-auto">
        <table className="tbl_heat">
          <thead>
            <tr className="bg-gray-200">
              <th scope="col" className="p-2 text-center" style={{ width: '70px' }} onClick={toggleRowSortOrder}>
                Question No.
                {rowSortOrder === "none" && <span>▲▼</span>}
                {rowSortOrder === "asc" && <span> ▲</span>}
                {rowSortOrder === "desc" && <span> ▼</span>}
              </th>
              {isQuestionListVisible && (
                <th scope="col" className="py-2 px-4 text-center" style={{ width: '150px' }}>Question</th>
              )}
              {selectedRoundData[0].reviews.map((_, i) => (
                <th key={i} scope="col" className="p-2 text-center" style={{ width: '70px' }}>
                  Review {i + 1}
                </th>
              ))}
              <th scope="col" className="py-2 px-4" style={{ width: '70px' }} onClick={toggleRowSortOrder}>
                Avg
                {rowSortOrder === "none" && <span>▲▼</span>}
                {rowSortOrder === "asc" && <span> ▲</span>}
                {rowSortOrder === "desc" && <span> ▼</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <ReviewTableRow
                key={index}
                row={row}
                isQuestionListVisible={isQuestionListVisible}
              />
            ))}
            <tr className="no-bg">
              <td className="py-2 px-4" style={{ width: '70px' }}>Avg</td> {/* "Avg" header always in the first column */}
              {isQuestionListVisible && <td></td>} {/* Add an empty cell if toggle question is shown */}
              {columnAverages.map((avg, index) => (
                <td key={index} className="py-2 px-4 text-center">
                  {avg.toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <br></br>
        <RoundSelector currentRound={selectedRound} handleRoundChange={handleRoundChange} />
      </div>

      {/* Statistics Section */}
      <Statistics average={averagePeerReviewScore} />

      {/* Grade Section */}
      <div className="my-2">
        <h3 className="text-lg font-medium">Grade and comment for submission</h3>
        <div className="space-y-1">
          <p>Grade: {dummyData.grade}</p>
          <p>Comment: {dummyData.comment}</p>
          <p>Late Penalty: {dummyData.late_penalty}</p>
        </div>
      </div>

      <Link to="/">Back</Link>
    </div>
  );
};

export default ReviewTable;
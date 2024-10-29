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

// Constant for sort order cycle sequence
const SORT_ORDER_SEQUENCE: Array<'asc' | 'desc' | 'none'> = ['asc', 'desc', 'none'];

const SubmissionDetails: React.FC<{ isVisible: boolean }> = ({ isVisible }) => (
  <Collapse in={isVisible}>
    <div className="flex flex-col mb-4">
      <br />
      <a href="https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents" target="_blank" rel="noopener noreferrer">
        GitHub Repository
      </a>
      <br />
      <a href="http://152.7.177.44:8080/" target="_blank" rel="noopener noreferrer">
        Project Link
      </a>
      <br />
      <a href="https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents/raw/main/README.md" download="README.md" target="_blank" rel="noopener noreferrer">
        Download README.md
      </a>
    </div>
  </Collapse>
);

const HeaderCells: React.FC<{ reviewCount: number }> = ({ reviewCount }) => (
  <>
    {Array.from({ length: reviewCount }).map((_, i) => (
      <th key={i} scope="col" className="p-2 text-center column-width-small">
        Review {i + 1}
      </th>
    ))}
  </>
);

const ReviewTable: React.FC = () => {
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [rowSortOrder, setRowSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [isQuestionListVisible, setIsQuestionListVisible] = useState(false);
  const [submissionDetailsVisible, setSubmissionDetailsVisible] = useState(false);

  // Calculate review count and selected round data
  const reviewCount = dummyDataRounds[selectedRound][0].reviews.length;
  const selectedRoundData = useMemo(() => dummyDataRounds[selectedRound], [selectedRound]);

  const { averagePeerReviewScore, columnAverages, sortedData } = useMemo(
    () => calculateAverages(selectedRoundData, rowSortOrder),
    [selectedRoundData, rowSortOrder]
  );

  // Toggle functions
  const toggleRowSortOrder = () => {
    const nextIndex = (SORT_ORDER_SEQUENCE.indexOf(rowSortOrder) + 1) % SORT_ORDER_SEQUENCE.length;
    setRowSortOrder(SORT_ORDER_SEQUENCE[nextIndex]);
  };

  const toggleVisibility = (setVisibility: React.Dispatch<React.SetStateAction<boolean>>) => {
    setVisibility(prev => !prev);
  };

  // Helper function for rendering sort order icon
  const renderSortIcon = () => {
    if (rowSortOrder === 'none') return <span>▲▼</span>;
    return rowSortOrder === 'asc' ? <span> ▲</span> : <span> ▼</span>;
  };

  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      {/* Report title and team info */}
      <h2 className="text-2xl font-bold mb-2">Summary Report: Program 2</h2>
      <h3 className="text-xl font-semibold mb-1">Team: {dummyData.team}</h3>
      <h5 className="mb-4">Average peer review score: <span>{averagePeerReviewScore}</span></h5>

      <div>Tagging: 97/97</div>
      <div className="mt-4 space-y-6">
        {/* Toggle for showing/hiding submission details */}
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            toggleVisibility(setSubmissionDetailsVisible);
          }}
          className="link-button"
        >
          {submissionDetailsVisible ? 'Hide Submission Details' : 'Show Submission Details'}
        </button>
        <SubmissionDetails isVisible={submissionDetailsVisible} />
      </div>

      {/* Review Section with round and question toggle options */}
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
          onChange={() => toggleVisibility(setIsQuestionListVisible)}
        />
        <label htmlFor="toggleQuestion"> &nbsp;Toggle Question List</label>
      </form>

      {/* Table displaying reviews, averages, and sorting functionality */}
      <div className="overflow-x-auto">
        <table className="tbl_heat">
          <thead>
            <tr className="bg-gray-200">
              <th scope="col" className="p-2 text-center column-width-small">Question No.</th>
              {isQuestionListVisible && (
                <th scope="col" className="py-2 px-4 text-center column-width-large">Question</th>
              )}
              <HeaderCells reviewCount={reviewCount} />
              <th scope="col" className="py-2 px-4 column-width-small" onClick={toggleRowSortOrder}>
                Avg
                {renderSortIcon()}
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
              <td className="py-2 px-4 column-width-small">Avg</td>
              {isQuestionListVisible && <td></td>}
              {columnAverages.map((avg, index) => (
                <td key={index} className="py-2 px-4 text-center">
                  {avg.toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <br />
        <RoundSelector currentRound={selectedRound} handleRoundChange={setSelectedRound} />
      </div>

      <Statistics average={averagePeerReviewScore} />

      {/* Grade and Comment Section for the submission */}
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

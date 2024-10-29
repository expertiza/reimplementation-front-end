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
  // State to manage selected round, row sort order, question visibility, and submission details visibility
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [rowSortOrder, setRowSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [isQuestionListVisible, setIsQuestionListVisible] = useState(false);
  const [submissionDetailsVisible, setSubmissionDetailsVisible] = useState(false);

  // Cycles through sort order states: asc -> desc -> none
  const toggleRowSortOrder = () => {
    const sortOrderSequence = ['asc', 'desc', 'none'];
    const nextIndex = (sortOrderSequence.indexOf(rowSortOrder) + 1) % sortOrderSequence.length;
    setRowSortOrder(sortOrderSequence[nextIndex] as 'asc' | 'desc' | 'none');
  };

  // Select data for the currently selected round
  const selectedRoundData = useMemo(() => dummyDataRounds[selectedRound], [selectedRound]);

  // Calculate averages and sorted data based on selected round and sort order
  const { averagePeerReviewScore, columnAverages, sortedData } = useMemo(
    () => calculateAverages(selectedRoundData, rowSortOrder),
    [selectedRoundData, rowSortOrder]
  );

  // Update selected round based on round change
  const handleRoundChange = (roundIndex: number) => {
    setSelectedRound(roundIndex);
  };

  // Toggles the visibility of the question list
  const toggleQuestionVisibility = () => {
    setIsQuestionListVisible(!isQuestionListVisible);
  };

  // Toggles visibility of submission details section
  const toggleSubmissionDetailsVisibility = () => {
    setSubmissionDetailsVisible(!submissionDetailsVisible);
  };

  // Renders header cells dynamically based on review data
  const renderHeaderCells = () => (
    selectedRoundData[0].reviews.map((_, i) => (
      <th key={i} scope="col" className="p-2 text-center column-width-small">
        Review {i + 1}
      </th>
    ))
  );

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
            {/* Submission details including links to project resources */}
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
                {/* Downloadable link for README.md */}
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
          onChange={toggleQuestionVisibility}
        />
        <label htmlFor="toggleQuestion"> &nbsp;Toggle Question List</label>
      </form>

      {/* Table displaying reviews, averages, and sorting functionality */}
      <div className="overflow-x-auto">
        <table className="tbl_heat">
          <thead>
            <tr className="bg-gray-200">
              {/* Header for question number */}
              <th scope="col" className="p-2 text-center column-width-small">
                Question No.
              </th>

              {/* Conditional header for question text, visible if toggle is active */}
              {isQuestionListVisible && (
                <th scope="col" className="py-2 px-4 text-center column-width-large">Question</th>
              )}

              {/* Header cells for each review dynamically rendered */}
              {renderHeaderCells()}

              {/* Header for average score with sort order icon toggle */}
              <th scope="col" className="py-2 px-4 column-width-small" onClick={toggleRowSortOrder}>
                Avg
                {rowSortOrder === "none" && <span>▲▼</span>}
                {rowSortOrder === "asc" && <span> ▲</span>}
                {rowSortOrder === "desc" && <span> ▼</span>}
              </th>
            </tr>
          </thead>
          
          <tbody>
            {/* Render rows of review data */}
            {sortedData.map((row, index) => (
              <ReviewTableRow
                key={index}
                row={row}
                isQuestionListVisible={isQuestionListVisible}
              />
            ))}

            {/* Row for column averages aligned with "Avg" header */}
            <tr className="no-bg">
              <td className="py-2 px-4 column-width-small">Avg</td>
              {/* Empty cell for question column if visible */}
              {isQuestionListVisible && <td></td>}
              {/* Display averages for each review column */}
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

      {/* Statistics component showing summary statistics */}
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

      {/* Link to navigate back */}
      <Link to="/">Back</Link>
    </div>
  );
};

export default ReviewTable;

import React, { useState } from 'react';
import ReviewTableRow from './ReviewTableRow'; // Importing the ReviewTableRow component
import RoundSelector from './RoundSelector'; // Importing the RoundSelector component
import dummyDataRounds from './Data/heatMapData.json'; // Importing dummy data for rounds
import dummyData from './Data/dummyData.json'; // Importing dummy data
import { calculateAverages, getColorClass } from './utils'; // Importing utility functions
import './grades.scss'; // Importing styles
import { Link } from 'react-router-dom'; // Importing Link from react-router-dom
import ShowSubmission from './ShowSubmission';

// Functional component ReviewTable
const ReviewTable: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<number>(0); // State for current round
  const [sortOrderRow, setSortOrderRow] = useState<'asc' | 'desc' | 'none'>('none'); // State for row sort order
  const [showWordCount10, setShowWordCount10] = useState(false); // State for showing reviews with more than 10 words
  const [showWordCount20, setShowWordCount20] = useState(false); // State for showing reviews with more than 20 words

  // Function to toggle the sort order for rows
  const toggleSortOrderRow = () => {
    setSortOrderRow((prevSortOrder) => {
      if (prevSortOrder === 'asc') return 'desc';
      if (prevSortOrder === 'desc') return 'none';
      return 'asc';
    });
  };

  // Calculating averages and sorting data based on the current round and sort order
  const currentRoundData = dummyDataRounds[currentRound];
  const { averagePeerReviewScore, columnAverages, sortedData } = calculateAverages(
    currentRoundData,
    sortOrderRow
  );

  // Function to handle round change
  const handleRoundChange = (roundIndex: number) => {
    setCurrentRound(roundIndex);
    setShowWordCount10(false);
    setShowWordCount20(false);
  };

  // JSX rendering of the ReviewTable component
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Summary Report for assignment: Program 2</h2>
      <h5 className="text-xl font-semibold mb-1">Team: {dummyData.team}</h5>
      <h5 className="mb-4">
        Average peer review score:{" "}
        <span className={getColorClass(parseFloat(averagePeerReviewScore), 100)}>{averagePeerReviewScore}</span>
      </h5>
      <ShowSubmission/>
      <h4 className="text-xl font-semibold mb-1">Review (Round: {currentRound + 1} of {dummyDataRounds.length}) </h4>
      <br></br>
      <form>
        <input
          type="checkbox"
          id="wordCount10"
          name="wordCount10"
          checked={showWordCount10}
          onChange={(e) => setShowWordCount10(e.target.checked)}
        />
        <label htmlFor="wordCount10"> &nbsp; More than 10 words &nbsp;</label>
        <input
          type="checkbox"
          id="wordCount20"
          name="wordCount20"
          checked={showWordCount20}
          onChange={(e) => setShowWordCount20(e.target.checked)}
        />
        <label htmlFor="wordCount20"> &nbsp;More than 20 words</label>
        <span className="color-legend">
          &nbsp; Color Legend &nbsp;
        <span className="tooltip-text">
          Colors are scaled from Poor to Excellent in the following order: Red, Orange, Yellow, Light Green, Dark Green
        </span>
        </span>
      </form>

      <div className="table-container">
        <table className="tbl_heat">
          <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4">Question No.</th>
            {Array.from({ length: currentRoundData[0].reviews.length }, (_, i) => (
              <th key={i} className="py-2 px-4 text-center">{`Review ${i + 1}`}</th>
            ))}
            <th className="py-2 px-4" onClick={toggleSortOrderRow}>
              Avg
              {sortOrderRow === "none" && <span>▲▼</span>}
              {sortOrderRow === "asc" && <span> ▲</span>}
              {sortOrderRow === "desc" && <span> ▼</span>}
            </th>
            {showWordCount10 && <th className="py-2 px-4 text-center">10+ Words</th>}
            {showWordCount20 && <th className="py-2 px-4 text-center">20+ Words</th>}
          </tr>
          </thead>
          <tbody>
          {sortedData.map((row, index) => (
            <ReviewTableRow
              key={index}
              row={row}
              showWordCount10={showWordCount10}
              showWordCount20={showWordCount20}
            />
          ))}
          <tr className="no-bg">
            <td className="py-2 px-4">Avg</td>
            {columnAverages.map((avg, index) => (
              <td key={index} className="py-2 px-4 text-center">
                {avg.toFixed(2)}
              </td>
            ))}
          </tr>
          </tbody>
        </table>
        <br></br>
        <RoundSelector currentRound={currentRound} handleRoundChange={handleRoundChange} />
      </div>
      <p className="mt-4">
        <h3>Grade and comment for submission</h3>
        Grade: {dummyData.grade}<br></br>
        Comment: {dummyData.comment}<br></br>
        Late Penalty: {dummyData.late_penalty}<br></br>
      </p>
      <Link to="/">Back</Link>
    </div>
  );
};

export default ReviewTable; // Exporting the ReviewTable component as default

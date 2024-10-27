import React, { useEffect, useState } from 'react';
import ReviewTableRow from './ReviewTableRow'; // Importing the ReviewTableRow component
import RoundSelector from './RoundSelector'; // Importing the RoundSelector component
import dummyDataRounds from './Data/heatMapData.json'; // Importing dummy data for rounds
import dummyData from './Data/dummyData.json'; // Importing dummy data
import { calculateAverages, getColorClass } from './utils'; // Importing utility functions
import './grades.scss'; // Importing styles
import { Link } from 'react-router-dom'; // Importing Link from react-router-dom
import Statistics from './Statistics'; //import statistics component
import { Button, Collapse } from 'react-bootstrap'; //imporitng collaspe button


// Functional component ReviewTable
const ReviewTable: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<number>(0); // State for current round
  const [sortOrderRow, setSortOrderRow] = useState<'asc' | 'desc' | 'none'>('none'); // State for row sort order
  const [showToggleQuestion, setShowToggleQuestion] = useState(false); // State for showing question column
  const [open, setOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  // Fetch team members from the teamData.json file on component mount
  useEffect(() => {
    setTeamMembers(dummyData.members);
  }, []); // Empty dependency array means it runs only once on component mount

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
  };
  //Function to handle Show Question
  const toggleShowQuestion = () => {
    setShowToggleQuestion(!showToggleQuestion);
  };

  // JSX rendering of the ReviewTable component
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Summary Report: Program 2</h2>
      <h5 className="text-xl font-semibold mb-1">Team: {dummyData.team}</h5>
      <span className="ml-4">
        Team members: {teamMembers.map((member, index) => (
          <span key={index}>
            {member}
            {index !== teamMembers.length - 1 && ', '}
          </span>
        ))}
      </span>
      <h5 className="mb-4">
        Average peer review score:{" "}
        <span>{averagePeerReviewScore}</span>
      </h5>
      <div>Tagging: 97/97</div>
      <div>
        <a href="#" onClick={(e) => { e.preventDefault(); setOpen(!open); }}>
          {open ? 'Hide Submission' : 'Show Submission'}
        </a>
        {/* Collapsible content */}
        <Collapse in={open}>
          <div id="example-collapse-text">
            <br></br>
            {/* Render links only when open is true */}
            {open && (
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

      <h4 className="text-xl font-semibold mb-1">Review (Round: {currentRound + 1} of {dummyDataRounds.length}) </h4>
      <br></br>
      <RoundSelector currentRound={currentRound} handleRoundChange={handleRoundChange} />
      {/* toggle Question Functionality */}
      <form>
        <input
          type="checkbox"
          id="toggleQuestion"
          name="toggleQuestion"
          checked={showToggleQuestion}
          onChange={toggleShowQuestion}
        />
        <label htmlFor="toggleQuestion"> &nbsp;Toggle Question List</label>
      </form>
      <div className="table-container">
        <table className="tbl_heat">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 text-center" style={{ width: '70px' }}>Question No.</th>
              {showToggleQuestion && (
                <th className="py-2 px-4 text-center" style={{ width: '150px' }}>Question</th>
              )}
              {Array.from({ length: currentRoundData[0].reviews.length }, (_, i) => (
                <th key={i} className="py-2 px-4 text-center" style={{ width: '70px' }}>{`Review ${i + 1}`}</th>
              ))}
              <th className="py-2 px-4" style={{ width: '70px' }} onClick={toggleSortOrderRow}>
                Avg
                {sortOrderRow === "none" && <span>▲▼</span>}
                {sortOrderRow === "asc" && <span> ▲</span>}
                {sortOrderRow === "desc" && <span> ▼</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <ReviewTableRow
                key={index}
                row={row}
                showToggleQuestion={showToggleQuestion}
              />
            ))}
            <tr className="no-bg">
              <td className="py-2 px-4" style={{ width: '70px' }}>Avg</td> {/* "Avg" header always in the first column */}
              {showToggleQuestion && <td></td>} {/* Add an empty cell if toggle question is shown */}
              {columnAverages.map((avg, index) => (
                <td key={index} className="py-2 px-4 text-center">
                  {avg.toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <br></br>
      </div>
      {/* view stats functionality */}
      <Statistics average={averagePeerReviewScore} />

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

// import React, { useState } from 'react';
// import ReviewTableRow from './ReviewTableRow';
// import RoundSelector from './RoundSelector';
// import dummyDataRounds from './Data/heatMapData.json'; // Ensure this import aligns with actual data structure
// import dummyData from './Data/dummyData.json';
// import { calculateAverages, getColorClass } from './utils';
// import './grades.scss';
// import { Link } from 'react-router-dom';
// import ShowSubmission from './ShowSubmission';
// import { ReviewData } from './App'; // Adjust the import path as necessary

// const ReviewTable: React.FC = () => {
//   const [currentRound, setCurrentRound] = useState<number>(0);
//   const [sortOrderRow, setSortOrderRow] = useState<'asc' | 'desc' | 'none'>('none');
//   const [showWordCount10, setShowWordCount10] = useState(false);
//   const [showWordCount20, setShowWordCount20] = useState(false);
//   const [showFullQuestion, setShowFullQuestion] = useState(false);
//   const [showAll, setShowAll] = useState<boolean>(false);

//   const toggleSortOrderRow = () => {
//     setSortOrderRow((prevSortOrder) => {
//       if (prevSortOrder === 'asc') return 'desc';
//       if (prevSortOrder === 'desc') return 'none';
//       return 'asc';
//     });
//   };
  
//   const currentRoundData = dummyDataRounds[currentRound];
//   const { averagePeerReviewScore } = showAll
//     ? calculateAverages(dummyDataRounds, 'none')
//     : calculateAverages([dummyDataRounds[currentRound]], 'none');

//   const handleRoundChange = (roundIndex: number) => {
//     setCurrentRound(roundIndex);
//     setShowAll(false);
//   };

//   const showAllRounds = () => {
//     setShowAll(true);
//   };
  
//   const colorLegend = [
//     { color: 'Red', description: 'Poor', className: 'c1' },
//     { color: 'Orange', description: 'Fair', className: 'c2' },
//     { color: 'Yellow', description: 'Average', className: 'c3' },
//     { color: 'LightGreen', description: 'Good', className: 'c4' },
//     { color: 'DarkGreen', description: 'Excellent', className: 'c5' },
//   ];

//   const renderTableForRound = (roundData: ReviewData[], roundIndex: number) => {
//     const { columnAverages, sortedData } = calculateAverages([roundData], sortOrderRow);

//     return (
//       <>
//         <h4 className="text-xl font-semibold mb-1">Review (Round: {roundIndex + 1} of {dummyDataRounds.length})</h4>
// 		<div className="table-container">
//         <table className="tbl_heat">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="py-2 px-4">Question No.</th>
//               {Array.from({ length: roundData[0].reviews.length }, (_, i) => (
//                 <th key={i} className="py-2 px-4 text-center">{`Review ${i + 1}`}</th>
//               ))}
//               <th className="py-2 px-4" onClick={toggleSortOrderRow}>
//                 Avg
//                 {sortOrderRow === "none" && <span>▲▼</span>}
//                 {sortOrderRow === "asc" && <span>▲</span>}
//                 {sortOrderRow === "desc" && <span>▼</span>}
//               </th>
//               {showWordCount10 && <th className="py-2 px-4 text-center">10+ Words</th>}
//               {showWordCount20 && <th className="py-2 px-4 text-center">20+ Words</th>}
//             </tr>
//           </thead>
//           <tbody>
//             {sortedData.map((row, index) => (
//               <ReviewTableRow
//                 key={index}
//                 row={row}
//                 showWordCount10={showWordCount10}
//                 showWordCount20={showWordCount20}
//                 showFullQuestion={showFullQuestion}
//               />
//             ))}
//             <tr className="no-bg">
//               <td className="py-2 px-4">Avg</td>
//               {columnAverages.map((avg, index) => (
//                 <td key={index} className="py-2 px-4 text-center">
//                   {avg.toFixed(2)}
//                 </td>
//               ))}
//             </tr>
//           </tbody>
//         </table>
// 		</div>

//       </>
//     );
//   };

//   return (
//     <div className="p-4">
//       <div className="review-container">
//       <div className="color-legend-container">
//       <span className="color-legend">
//         &nbsp; Color Legend &nbsp;
//         <span className="tooltip-text">
//           Colors are scaled from Poor to Excellent in the following order: Red, Orange, Yellow, Light Green, Dark Green
//         </span>
//       </span>
//       <div className="color-legend-table">
//         <table>
//           <thead>
//             <tr>
//               <th>Color</th>
//               <th>Rating</th>
//             </tr>
//           </thead>
//           <tbody>
//             {colorLegend.map((item) => (
//               <tr key={item.color}>
//                 <td className={item.className}></td>
//                 <td>{item.description}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//     </div>

//       <h2 className="text-2xl font-bold mb-2">Summary Report for assignment: Program 2</h2>
// 	  <h5 className="text-xl font-semibold mb-1">Team: {dummyData.team}</h5>
//       <h5 className="mb-4">
//         Average peer review score:{" "}
//         <span className={getColorClass(parseFloat(averagePeerReviewScore), 100)}>{averagePeerReviewScore}</span>
//       </h5>
// 	  <ShowSubmission />
//     <br></br>
//       <form>
//         <input
//           type="checkbox"
//           id="wordCount10"
//           name="wordCount10"
//           checked={showWordCount10}
//           onChange={(e) => setShowWordCount10(e.target.checked)}
//         />
//         <label htmlFor="wordCount10"> &nbsp; Reviews with more than 10 words &nbsp;&nbsp;</label>
//         <input
//           type="checkbox"
//           id="wordCount20"
//           name="wordCount20"
//           checked={showWordCount20}
//           onChange={(e) => setShowWordCount20(e.target.checked)}
//         />
//         <label htmlFor="wordCount20">&nbsp;Reviews with more than 20 words</label>
//         <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
//         <input
//           type="checkbox"
//           id="viewQuestions"
//           name="viewQuestions"
//           checked={showFullQuestion}
//           onChange={(e) => setShowFullQuestion(e.target.checked)}
//         />
//         <label htmlFor="showQuestions"> &nbsp;Show Review Questions</label>
//       </form>
      
//       {showAll ? (
//         <>
//           {dummyDataRounds.map((roundData, index) => (
//             <div key={index} className="mb-8">
//               {renderTableForRound(roundData, index)}
//             </div>
//           ))}
//         </>
//       ) : (
//         <div>
//           {renderTableForRound(dummyDataRounds[currentRound], currentRound)}
//         </div>
//       )}
//       <RoundSelector currentRound={currentRound} handleRoundChange={handleRoundChange} showAllRounds={showAllRounds} />
// 	  <p className="mt-4">
//         <h3>Grade and comment for submission</h3>
//         Grade: {dummyData.grade}<br></br>
//         Comment: {dummyData.comment}<br></br>
//         Late Penalty: {dummyData.late_penalty}<br></br>
//       </p>
//       <Link to="/">Back</Link>
//     </div>
//   );
// };

// export default ReviewTable;

import React, { useState } from 'react';
import ReviewTableRow from './ReviewTableRow';
import RoundSelector from './RoundSelector';
import dummyDataRounds from './Data/heatMapData.json'; // Ensure this import aligns with actual data structure
import dummyData from './Data/dummyData.json';
import { calculateAverages, getColorClass } from './utils';
import './grades.scss';
import { Link } from 'react-router-dom';
import ShowSubmission from './ShowSubmission';
import { ReviewData } from './App'; // Adjust the import path as necessary

const ReviewTable: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [sortOrderRow, setSortOrderRow] = useState<'asc' | 'desc' | 'none'>('none');
  const [showWordCount10, setShowWordCount10] = useState(false);
  const [showWordCount20, setShowWordCount20] = useState(false);
  const [showFullQuestion, setShowFullQuestion] = useState(false);
  const [showAll, setShowAll] = useState<boolean>(false);

  const toggleSortOrderRow = () => {
    setSortOrderRow((prevSortOrder) => {
      if (prevSortOrder === 'asc') return 'desc';
      if (prevSortOrder === 'desc') return 'none';
      return 'asc';
    });
  };
  
  // const currentRoundData = dummyDataRounds[currentRound];
  const { averagePeerReviewScore } = showAll
    ? calculateAverages(dummyDataRounds, 'none')
    : calculateAverages([dummyDataRounds[currentRound]], 'none');

  const handleRoundChange = (roundIndex: number) => {
    setCurrentRound(roundIndex);
    setShowAll(false);
  };

  const showAllRounds = () => {
    setShowAll(true);
  };
  
  const colorLegend = [
    { color: 'Red', description: 'Poor', className: 'c1' },
    { color: 'Orange', description: 'Fair', className: 'c2' },
    { color: 'Yellow', description: 'Average', className: 'c3' },
    { color: 'LightGreen', description: 'Good', className: 'c4' },
    { color: 'DarkGreen', description: 'Excellent', className: 'c5' },
  ];

  const renderTableForRound = (roundData: ReviewData[], roundIndex: number) => {
    const { columnAverages, sortedData } = calculateAverages([roundData], sortOrderRow);

    return (
      <>
        <h4 className="text-xl font-semibold mb-1">Review (Round: {roundIndex + 1} of {dummyDataRounds.length})</h4>
          <div className="table-container">
            <table className="tbl_heat">
              <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4">Question No.</th>
                {Array.from({ length: roundData[0].reviews.length }, (_, i) => (
                  <th key={i} className="py-2 px-4 text-center">{`Review ${i + 1}`}</th>
                ))}
                <th className="py-2 px-4" onClick={toggleSortOrderRow}>
                  Avg
                  {sortOrderRow === "none" && <span>▲▼</span>}
                  {sortOrderRow === "asc" && <span>▲</span>}
                  {sortOrderRow === "desc" && <span>▼</span>}
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
                  showFullQuestion={showFullQuestion}
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
          </div>
      </>
    );
  };

  return (
    <div className="p-4">
      <div className="review-container">
        <div className="color-legend-container">
        <span className="color-legend">
          &nbsp; Color Legend &nbsp;
        </span>
          <div className="color-legend-table">
            <table>
              <thead>
              <tr>
                <th>Color</th>
                <th>Rating</th>
              </tr>
              </thead>
              <tbody>
              {colorLegend.map((item) => (
                <tr key={item.color}>
                  <td className={item.className}></td>
                  <td>{item.description}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Summary Report for assignment: Program 2</h2>
      <h5 className="text-xl font-semibold mb-1">Team: {dummyData.team}</h5>
      <h5 className="mb-4">
        Average peer review score:{" "}
        <span className={getColorClass(parseFloat(averagePeerReviewScore), 100)}>{averagePeerReviewScore}</span>
      </h5>
      <ShowSubmission />
      <br></br>
      <form>
        <input
          type="checkbox"
          id="wordCount10"
          name="wordCount10"
          checked={showWordCount10}
          onChange={(e) => setShowWordCount10(e.target.checked)}
        />
        <label htmlFor="wordCount10"> &nbsp; Reviews with more than 10 words &nbsp;&nbsp;</label>
        <input
          type="checkbox"
          id="wordCount20"
          name="wordCount20"
          checked={showWordCount20}
          onChange={(e) => setShowWordCount20(e.target.checked)}
        />
        <label htmlFor="wordCount20">&nbsp;Reviews with more than 20 words</label>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <input
          type="checkbox"
          id="viewQuestions"
          name="viewQuestions"
          checked={showFullQuestion}
          onChange={(e) => setShowFullQuestion(e.target.checked)}
        />
        <label htmlFor="showQuestions"> &nbsp;Show Review Questions</label>
      </form>
      <br></br>


      {showAll ? (
        <>
          {dummyDataRounds.map((roundData, index) => (
            <div key={index} className="mb-8">
              {renderTableForRound(roundData, index)}
            </div>
          ))}
        </>
      ) : (
        <div>
          {renderTableForRound(dummyDataRounds[currentRound], currentRound)}
        </div>
      )}
      <RoundSelector currentRound={currentRound} handleRoundChange={handleRoundChange} showAllRounds={showAllRounds} />
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

export default ReviewTable;
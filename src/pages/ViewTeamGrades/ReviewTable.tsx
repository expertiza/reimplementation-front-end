import React, { useState } from 'react';
import './grades.scss';
import ShowSubmission from './ShowSubmission'; // Import the ShowSubmission component

interface ReviewData {
  question: string;
  reviews: number[];
  RowAvg: number;
  maxScore: number;
}

const dummyData: ReviewData[] = [
  {
    question: '1',
    reviews: [5, 4, 4, 4, 5, 5, 5, 5, 2, 5],
    RowAvg: 0,
    maxScore: 5
  },
  {
    question: '2',
    reviews: [5, 3, 5, 3, 5, 5, 5, 5, 5, 5],
    RowAvg: 0,
    maxScore: 5
  },
  {
    question: '3',
    reviews: [1, 5, 5, 4, 5, 5, 5, 5, 5, 5],
    RowAvg: 0,
    maxScore: 5
  },
  {
    question: '4',
    reviews: [1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
    RowAvg: 0,
    maxScore: 1
  }
  // Add more dummy data as needed
];

let totalAvg = 0;
let questionCount = 0;
let totalMaxScore = 0;
// Calculate average for each row
dummyData.forEach((row) => {
  const sum = row.reviews.reduce((acc, val) => acc + val, 0);
  row.RowAvg = sum / row.reviews.length;
  totalAvg = row.RowAvg + totalAvg;
  totalMaxScore = totalMaxScore + row.maxScore
  questionCount++;
});

const averagePeerReviewScore =
  questionCount > 0
    ? (((totalAvg / totalMaxScore) * 100) > 0 ? ((totalAvg / totalMaxScore) * 100).toFixed(2) : '0.00')
    : '0.00';

const columnAverages: number[] = Array.from({ length: dummyData[0].reviews.length }, () => 0);

// Calculate column averages
dummyData.forEach((row) => {
  row.reviews.forEach((val, index) => {
    columnAverages[index] += val;
  });
});

columnAverages.forEach((sum, index) => {
  columnAverages[index] = (sum / totalMaxScore) * 5;
});

const ReviewTable: React.FC = () => {
  const [filterValue, setFilterValue] = useState<number | null>(null);
  const [sortOrderRow, setsortOrderRow] = useState<'asc' | 'desc' | 'none'>('none');
  const toggleSortOrderRow = () => {
    setsortOrderRow((prevSortOrder) => {
      if (prevSortOrder === 'asc') return 'desc';
      if (prevSortOrder === 'desc') return 'none';
      return 'asc';
    });
  };

  const getColorClass = (score: number, maxScore: number) => {
    let scoreColor = score;
    scoreColor = ((maxScore - scoreColor) / maxScore) * 100;
    if (scoreColor >= 80) return 'c1';
    else if (scoreColor >= 60 && scoreColor < 80) return 'c2';
    else if (scoreColor >= 40 && scoreColor < 60) return 'c3';
    else if (scoreColor >= 20 && scoreColor < 40) return 'c4';
    else if (scoreColor >= 0 && scoreColor < 20) return 'c5';
    else return 'cf';
  };

  const averageScoreColorClass = getColorClass(totalAvg , totalMaxScore);
  let sortedData = [...dummyData];

  if (sortOrderRow === 'asc') {
    sortedData = dummyData.slice().sort((a, b) => a.RowAvg - b.RowAvg);
  } else if (sortOrderRow === 'desc') {
    sortedData = dummyData.slice().sort((a, b) => b.RowAvg - a.RowAvg);
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Summary Report for assignment: Program 2</h2>
      <h5 className="text-xl font-semibold mb-1">Team: Nisarg_Chaitanya_Sagar</h5>
      <h5 className="mb-4">Average peer review score: <span className={averageScoreColorClass}>{averagePeerReviewScore}</span></h5>
      <ShowSubmission />
      <div className="table-container">
        <br></br>
        <table className="tbl_heat">
          <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4">Question No.</th>
            {Array.from({ length: dummyData[0].reviews.length }, (_, i) => (
              <th key={i} className="py-2 px-4 text-center">{`Review ${i + 1}`}</th>
            ))}
            <th className="py-2 px-4" onClick={toggleSortOrderRow}>
              Avg
              {sortOrderRow === "none" && <span>▲▼</span>}
              {sortOrderRow === "asc" && <span> ▲</span>}
              {sortOrderRow === "desc" && <span> ▼</span>}
            </th>
          </tr>
          </thead>
          <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className={index === sortedData.length - 1 ? "no-bg" : ""}>
              <td className="py-2 px-4">{row.question}</td>
              {row.reviews.map((review, idx) => (
                <td key={idx} className={`py-2 px-4 text-center ${getColorClass(review, row.maxScore)}`}>{review}</td>
              ))}
              <td className="py-2 px-4 text-center">{row.RowAvg.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="no-bg">
            <td className="py-2 px-4">Avg</td>
            {columnAverages.map((avg, index) => (
              <td key={index} className="py-2 px-4 text-center">{avg.toFixed(2)}</td>
            ))}
          </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4">
        Team members: (Chaitanya Srusti) (Nisarg Nilesh Doshi) (Malick, Kashika) (Sagar Dama)
      </p>
    </div>
  );
};

export default ReviewTable;

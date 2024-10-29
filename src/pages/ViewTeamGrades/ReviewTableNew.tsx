import React, { useState } from 'react';
import ReviewTableRow from './ReviewTableRow'; // Importing the ReviewTableRow component
import RoundSelector from './RoundSelector'; // Importing the RoundSelector component
import dummyDataRounds from './Data/heatMapData.json'; // Importing dummy data for rounds
import dummyData from './Data/dummyData.json'; // Importing dummy data
import { calculateAverages, getColorClass } from './utils'; // Importing utility functions
import './grades.scss'; // Importing styles
import { Link } from 'react-router-dom'; // Importing Link from react-router-dom
import Statistics from './Statistics'; //import statistics component
import { Button, Card, CardHeader, CardTitle, Col, Collapse, Row } from 'react-bootstrap'; //imporitng collaspe button

interface Review {
  name: string;
  score: number;
  comment?: string;  // Made comment optional
}

interface Question {
  questionNumber: string;
  questionText: string;
  reviews: Review[];
  RowAvg: number;
  maxScore: number;
}

type Round = Question[];
type RoundsData = Round[];


// Functional component ReviewTable
const ReviewTable: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<number>(0); // State for current round
  const [sortOrderRow, setSortOrderRow] = useState<'asc' | 'desc' | 'none'>('none'); // State for row sort order
  const [showToggleQuestion, setShowToggleQuestion] = useState(false); // State for showing question column
  const [open, setOpen] = useState(false); 

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

  const [hoveredState, setHoveredState] = useState<{
    questionIndex: number;
    review: Review;
  } | null>(null);

  const getColor = (score: number, maxScore: number) => {
    const intensity = (score / maxScore) * 100;
    return `rgba(0, 100, 255, ${intensity / 100})`;
  };

  const calculateStats = (reviews: Review[]) => {
    const avgScore = reviews.reduce((acc, review) => acc + review.score, 0) / reviews.length;
    const maxScore = Math.max(...reviews.map(review => review.score));
    const minScore = Math.min(...reviews.map(review => review.score));
    return { avgScore, maxScore, minScore };
  };

  // JSX rendering of the ReviewTable component
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Summary Report: Program 2</h2>
      <h5 className="text-xl font-semibold mb-1">Team: {dummyData.team}</h5>
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

  

        
      <div className="mt-5">
      <Card className="shadow-lg">
        <Card.Body>
          <Row className="align-items-center justify-content-between mb-4">
            <h1 className="h4 font-weight-bold">Review Heat Grid</h1>
            <div className="text-muted small">Hover over cells to see comments</div>
          </Row>

          {dummyDataRounds.map((round, roundIndex) => (
            <div key={roundIndex} className="mb-5">
              <h2 className="h5 font-weight-bold mb-3">Round {roundIndex + 1}</h2>

              <div className="mb-4">
                {round.map((question, qIndex) => {
                  const stats = calculateStats(question.reviews);

                  return (
                    <div key={qIndex} className="mb-4">
                      <h3 className="h6 font-weight-semibold mb-2">
                        Question {question.questionNumber}: {question.questionText}
                      </h3>
                      <div className="text-muted small mb-3">
                        Average Score: {stats.avgScore.toFixed(2)} | Max Score: {stats.maxScore} | Min Score: {stats.minScore}
                      </div>

                      {/* Scores Row */}
                      <Row className="flex-wrap gap-2">
                        {question.reviews.map((review, index) => (
                          <Col
                            key={index}
                            xs="auto"
                            className="d-flex align-items-center justify-content-center position-relative"
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: getColor(review.score, question.maxScore),
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onMouseEnter={() => setHoveredState({ questionIndex: qIndex, review })}
                            onMouseLeave={() => setHoveredState(null)}
                          >
                            <span className="text-white font-weight-bold">
                              {review.score}
                            </span>
                          </Col>
                        ))}
                      </Row>

                      {/* Hover Comment Box */}
                      {hoveredState && hoveredState.questionIndex === qIndex && (
                        <div className="mt-3 p-3 bg-light rounded">
                          <strong>{hoveredState.review.name}</strong>
                          <div className="text-muted small mt-1">
                            {hoveredState.review.comment}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <hr />
            </div>
          ))}

          {/* Score Legend */}
          <Row className="mt-5 align-items-center">
            <div className="small font-weight-medium mr-3">Score Legend:</div>
            <Row className="flex-nowrap">
              {[1, 2, 3, 4, 5].map((score) => (
                <Col
                  key={score}
                  xs="auto"
                  className="d-flex align-items-center justify-content-center text-white rounded mx-1"
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: getColor(score, 5),
                  }}
                >
                  {score}
                </Col>
              ))}
            </Row>
          </Row>
        </Card.Body>
      </Card>
    </div>
        <br></br>
        <RoundSelector currentRound={currentRound} handleRoundChange={handleRoundChange} />
      </div>
      {/* view stats functionality */}
      <Statistics average={averagePeerReviewScore}/>

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

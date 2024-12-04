// Statistics.tsx
import React,{useState, useEffect} from 'react';
import { calculateAverages } from './utils';
import './grades.scss';
import CircularProgress  from './CircularProgress';
import ShowReviews from './ShowReviews'; //importing show reviews component
import dummyDataRounds from './Data/heatMapData.json'; // Importing dummy data for rounds
import dummyauthorfeedback from './Data/authorFeedback.json'; // Importing dummy data for author feedback
import BarGraph from './BarGraph';
import teammateData from './Data/teammateData.json'; 
import AverageMarks from './teamMarks'; 

//props for statistics component
interface StatisticsProps {
  average:string;
}

//statistics component
const Statistics: React.FC<StatisticsProps> = ({average}) => {
  const [sortedData, setSortedData] = useState<any[]>([]);
  useEffect(() => {
    const { averagePeerReviewScore, columnAverages, sortedData } = calculateAverages(dummyDataRounds[0], "asc");
    const rowAvgArray = sortedData.map(item => item.RowAvg);
    console.log(rowAvgArray);
    setSortedData(sortedData.map(item => item.RowAvg));
  }, []); 

  const [statisticsVisible, setstatisticsVisible] = useState<boolean>(false);
  const toggleStatisticsVisibility = () => {
      setstatisticsVisible(!statisticsVisible);
  };
  const [showReviews, setShowReviews] = useState(false);
  const [ShowAuthorFeedback, setShowAuthorFeedback] = useState(false);

  // Function to toggle the visibility of ShowReviews component
  const toggleShowReviews = () => {
    setShowReviews(!showReviews);
  };

    // Function to toggle the visibility of ShowAuthorFeedback component
    const toggleAuthorFeedback = () => {
      setShowAuthorFeedback(!ShowAuthorFeedback);
    };

  const headerCellStyle: React.CSSProperties = {
    padding: '10px',
    textAlign: 'center',
    
  };

  //calculation for total reviews recieved
  let totalReviewsForQuestion1: number = 0;
  dummyDataRounds.forEach(round => {
    round.forEach(question => {
      if (question.questionNumber === "1") {
        totalReviewsForQuestion1 += question.reviews.length;
      }
    });
  });
  //calculation for total feedback recieved
  let totalfeedbackForQuestion1: number = 0;
  dummyauthorfeedback.forEach(round => {
    round.forEach(question => {
      if (question.questionNumber === "1") {
        totalfeedbackForQuestion1 += question.reviews.length;
      }
    });
  });


  const subHeaderCellStyle: React.CSSProperties = {
    padding: '10px',
    textAlign: 'center',
  };

  return (
    
    <div>
      
    <table style={{ width: '90%', borderBottom: '1px solid black' }}>
      <thead>
      <a href="#" onClick={(e) => { e.preventDefault(); toggleStatisticsVisibility();}}>
        {statisticsVisible ? 'hide stats' : 'show stats'}
      </a>
      {statisticsVisible && (
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
          <th style={{border: '1px solid black',borderBottom: 'none' }}></th>
          <th style={{ backgroundColor: 'rgb(232,232,232)', textAlign: 'center',border: '1px solid black',borderBottom: 'none'}} colSpan={2}>Submitted Work</th>
          {dummyauthorfeedback[0].length !== 0 && (
            <th style={{textAlign: 'center', border: '1px solid black',borderBottom: 'none'}} colSpan={2}>Author Feedback</th>
          )}
          {teammateData.length !== 0 && (
            <th style={{ backgroundColor: 'rgb(232,232,232)', textAlign: 'center',border: '1px solid black',borderBottom: 'none'}} colSpan={2}>Teammate Review</th>
          )}
          <th style={{border: '1px solid black',borderBottom: 'none' }}></th>
        </tr>
        <tr>
          <th style={{ borderLeft: '1px solid black', textAlign: 'center' }}>Contributor</th>
          <th style={{ backgroundColor: 'rgb(232,232,232)', textAlign: 'center',borderLeft: '1px solid black'  }}>Average</th>
          <th style={{ backgroundColor: 'rgb(232,232,232)', textAlign: 'center'}}>Range</th>
          {dummyauthorfeedback[0].length !== 0 && (
            <th style={{textAlign: 'center', borderLeft: '1px solid black' }}>Average</th>
          )}
          {dummyauthorfeedback[0].length !== 0 && (
            <th style={subHeaderCellStyle}>Range</th>
          )}
          {teammateData.length !== 0 && (
            <th style={{ backgroundColor: 'rgb(232,232,232)', textAlign: 'center',borderLeft: '1px solid black' }}>Average</th>
          )}
          {teammateData.length !== 0 && (
            <th style={{ backgroundColor: 'rgb(232,232,232)', textAlign: 'center',borderRight: '1px solid black'}}>Range</th>
          )}
          <th style={{textAlign: 'center', borderRight: '1px solid black'}}>Final Score</th>
        </tr>
        <tr>
            <td style={{borderLeft: '1px solid black', textAlign: 'center' }}>
              <div style={{textAlign: 'center' }}>
                <a href="#">ssshah26 </a><span>(Siddharth Shah)</span>
                <br />
              </div>
            </td>
            <td style={{backgroundColor: 'rgb(232,232,232)', textAlign: 'center',borderLeft: '1px solid black'  }}>
              <div style={{backgroundColor: 'rgb(232,232,232)', textAlign: 'center'}}>
                <div>{average}</div>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleShowReviews(); }}>
                    {showReviews ? 'Hide Reviews' : 'Show Reviews'}
                </a><span>({totalReviewsForQuestion1})</span>
              </div>
            </td>
            <td style={{backgroundColor: 'rgb(232,232,232)', textAlign: 'center' }}>
              <div style={{backgroundColor: 'rgb(232,232,232)', textAlign: 'center' }}>
                <div>99.99% - 100%</div>
              </div>
            </td>
            <td style={{textAlign: 'center', borderLeft: '1px solid black'  }}>
              
              {dummyauthorfeedback[0].length !== 0 && (
                <div style={{textAlign: 'center'}}>
                <div>96.67</div>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthorFeedback(); }}>
                    {ShowAuthorFeedback ? 'Hide Author Feedback' : 'Show Author Feedback'}
                </a><span>({totalfeedbackForQuestion1})</span>
              </div>
              )}
              <div>
      </div>
            </td>
            <td style={subHeaderCellStyle}>
              <div style={{textAlign: 'center' }}>
              {dummyauthorfeedback[0].length !== 0 && (
                <div>87% - 100%</div>
              )}   
              </div>
            </td>
            <td style={{backgroundColor: 'rgb(232,232,232)', textAlign: 'center',borderLeft: '1px solid black'  }}>
              <div style={{backgroundColor: 'rgb(232,232,232)', textAlign: 'center' }}>
                    {teammateData.length !== 0 && (
                      <div><AverageMarks data={teammateData} /></div>
                    )}
              </div>
            </td>
            <td style={{backgroundColor: 'rgb(232,232,232)', textAlign: 'center',borderRight: '1px solid black'}}>
              <div style={{backgroundColor: 'rgb(232,232,232)', textAlign: 'center' }}>
              {teammateData.length !== 0 && (
                      <div>90% - 100%</div>
                    )}
              </div>
            </td>
            <td style={{borderRight: '1px solid black'}}>
            {teammateData.length !== 0 && (
                      <div style={{textAlign: 'center' }}>
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
    <div> 
        {showReviews && (
          <div>
            <h2>Reviews</h2>
            <ShowReviews data={dummyDataRounds} />
          </div>
        )}
        {ShowAuthorFeedback && (
          <div>
            <h2>Author Feedback</h2>
            <ShowReviews data={dummyauthorfeedback} />
          </div>
        )}
      </div>
   </div> 
  );
  
};

export default Statistics;

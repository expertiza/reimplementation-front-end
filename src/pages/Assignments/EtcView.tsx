import React from 'react';
import './Etc.css';
// import addParticipantIcon from 'src/assets/scores.png';




  

const EtcView: React.FC = () => {
    

    return (
      <div className="etc-container">
      <h2>Etc Options</h2>
      <div className="etc-grid">
        <div className="etc-item">
          {/* <img src={addParticipantIcon} alt="Add Participant" className="etc-icon" /> */}
          <span>Add Participant</span>
        </div>
        <div className="etc-item">
          {/* <img src={addParticipantIcon} alt="Create Teams" className="etc-icon" /> */}
          <span>Create Teams</span>
        </div>
        <div className="etc-item">
          {/* <img src={addParticipantIcon} alt="Assign Reviewer" className="etc-icon" /> */}
          <span>Assign Reviewer</span>
        </div>
        <div className="etc-item">
          {/* <img src={addParticipantIcon} alt="View Submissions" className="etc-icon" /> */}
          <span>View Submissions</span>
        </div>
        <div className="etc-item">
          {/* <img src={addParticipantIcon} alt="View Scores" className="etc-icon" /> */}
          <span>View Scores</span>
        </div>
        <div className="etc-item">
          {/* <img src={addParticipantIcon} alt="View Reports" className="etc-icon" /> */}
          <span>View Reports</span>
        </div>
        <div className="etc-item">
          {/* <img src={addParticipantIcon} alt="View Delayed Jobs" className="etc-icon" /> */}
          <span>View Delayed Jobs</span>
        </div>
      </div>
      <div className="etc-actions">
        <button className="save-button">Save</button>
        <button className="back-button">Back</button>
      </div>
    </div>
);
};

export default EtcView;

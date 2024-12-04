import React, { useState } from 'react';
import './Etc.css';
import scoreIcon from '../../assets/scores.png';
import ParticipantIcon from '@mui/icons-material/Person';
import CreateTeamIcon from '@mui/icons-material/Groups3';
import ReviewerIcon from '@mui/icons-material/AssignmentInd';
import SubmissionIcon from '@mui/icons-material/Assignment';
import ReportIcon from '@mui/icons-material/Summarize';
import DelayedIcon from '@mui/icons-material/AccessTime'; 

const EtcView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Etc');
  const [showBanner, setShowBanner] = useState(false);

  // Tab click handler
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Save Button click handler
  const handleSave = () => {
    setShowBanner(true);
    // Hide banner after 3 seconds
    // setTimeout(() => {
    //   setShowBanner(false);
    // }, 3000);
  };

  // Back button click handler
  const handleBack = () => {
    window.location.href = '/assignments';
  };
    

  return (
    <div className="etc-container">
      {/* Save banner which pops up once save is clicked  */}
      {showBanner && (
        <div className="success-banner">
          The assignment was successfully saved!
        </div>
      )}
      <h2>Editing Assignment: Meta Review Fix_1</h2>
      <div className="etc-tab-pane">
      {/* Tab Navigation */}
        <div className="tab-navigation" >
          <button
            className={`tab ${activeTab === 'General' ? 'active' : ''}`}
          >
            General
          </button>
          <button
            className={`tab ${activeTab === 'Rubrics' ? 'active' : ''}`}
          >
            Rubrics
          </button>
          <button
            className={`tab ${activeTab === 'Review Strategy' ? 'active' : ''}`}
          >
            Review Strategy
          </button>
          <button
            className={`tab ${activeTab === 'Due Dates' ? 'active' : ''}`}
          >
            Due Dates
          </button>
          <button
            className={`tab ${activeTab === 'Badges' ? 'active' : ''}`}
            onClick={() => handleTabClick('Badges')}
          >
            Badges
          </button>
          <button
            className={`tab ${activeTab === 'Etc' ? 'active' : ''}`}
            onClick={() => handleTabClick('Etc')}
          >
            Etc
          </button>
        </div>


      
        <div className="tab-content">
          {activeTab === 'Badges' && <p>Badges Content</p>}
          {activeTab === 'Etc' &&  (
            <div>
              <div className="etc-grid">
                <div className="etc-item">
                <ParticipantIcon />
                  <span>Add Participant</span>
                </div>
                <div className="etc-item">
                <CreateTeamIcon />
                  <span>Create Teams</span>
                </div>
                <div className="etc-item">
                  <ReviewerIcon/>
                  <span>Assign Reviewer</span>
                </div>
                <div className="etc-item">
                  <SubmissionIcon/>
                  <span>View Submissions</span>
                </div>
                <div className="etc-item">
                  <img src={scoreIcon} alt="View Scores" className="etc-icon" />
                  <span>View Scores</span>
                </div>
                <div className="etc-item">
                  <ReportIcon/>
                  <span>View Reports</span>
                </div>
                <div className="etc-item">
                  <DelayedIcon/>
                  <span>View Delayed Jobs</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
      {/* Footer Action buttons */}
      <div className="etc-actions">
        <button onClick={handleSave} className="save-button">Save</button>
        <button onClick={handleBack} className="back-button">Back</button>
      </div>
    </div>
  );
};

export default EtcView;

import React from 'react';
import { useState } from "react";
import './Etc.css';
import { Tab, Tabs} from "react-bootstrap";
// import addParticipantIcon from '../../assets/participant1.png';
import scoreIcon from '../../assets/scores.png';
import ParticipantIcon from '@mui/icons-material/Person';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import CreateTeamIcon from '@mui/icons-material/Groups3';
import ReviewerIcon from '@mui/icons-material/AssignmentInd';
import SubmissionIcon from '@mui/icons-material/Assignment';
// import ScoreIcon from '@mui/icons-material/Grade';
import ReportIcon from '@mui/icons-material/Summarize';
import DelayedIcon from '@mui/icons-material/AccessTime';



  

const EtcView: React.FC = () => {
  // const [currentView, setCurrentView] = useState("general");
  // State to track the active tab
  const [activeTab, setActiveTab] = useState('Etc');

  // Tab click handler
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };
    

    return (

      <div className="etc-container">
        {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'General' ? 'active' : ''}`}
          onClick={() => handleTabClick('General')}
        >
          General
        </button>
        <button
          className={`tab ${activeTab === 'Rubrics' ? 'active' : ''}`}
          onClick={() => handleTabClick('Rubrics')}
        >
          Rubrics
        </button>
        <button
          className={`tab ${activeTab === 'Review Strategy' ? 'active' : ''}`}
          onClick={() => handleTabClick('Review Strategy')}
        >
          Review Strategy
        </button>
        <button
          className={`tab ${activeTab === 'Due Dates' ? 'active' : ''}`}
          onClick={() => handleTabClick('Due Dates')}
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

        {/* <Tabs
                id="assignment-tab"
                activeKey={currentView}
                // onSelect={(k) => setCurrentView(k)}
                className="mb-3"
                >
                <Tab title="General">
                </Tab>
                <Tab title="Rubrics">
                </Tab>
                <Tab  title="Review Strategy">
                </Tab>
                <Tab title="Due Dates">
                </Tab>
                <Tab  title="Badges">
                </Tab>
                <Tab title="Etc">
                    <EtcView />
                </Tab>
            </Tabs>  */}
        <div className="tab-content">
        {activeTab === 'General' && <p>General Content</p>}
        {activeTab === 'Rubrics' && <p>Rubrics Content</p>}
        {activeTab === 'Badges' && <p>Badges Content</p>}
        {activeTab === 'Etc' && (
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
          {/* <ScoreIcon/> */}
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
    
      <div className="etc-actions">
        <button className="save-button">Save</button>
        <button className="back-button">Back</button>
      </div>
    </div>
);
};

export default EtcView;

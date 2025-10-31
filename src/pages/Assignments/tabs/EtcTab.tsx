import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faUserCheck,
  faClock,
  faFileAlt,
  faChartBar,
  faUsers,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';

interface EtcTabProps {
  assignmentId?: number;
}

const EtcTab: React.FC<EtcTabProps> = ({ assignmentId }) => {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="alert alert-info">
        <h4>Assignment Actions</h4>
        <div className="assignment-actions d-flex flex-wrap justify-content-start">
          <div className="custom-tab-button" onClick={() => navigate(`participants`)}>
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span>Add Participant</span>
          </div>
          <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentId}/createteams`)}>
            <FontAwesomeIcon icon={faUsers} className="icon" />
            <span>Create Teams</span>
          </div>
          <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentId}/assignreviewer`)}>
            <FontAwesomeIcon icon={faUserCheck} className="icon" />
            <span>Assign Reviewer</span>
          </div>
          <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentId}/viewsubmissions`)}>
            <FontAwesomeIcon icon={faClipboardList} className="icon" />
            <span>View Submissions</span>
          </div>
          <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentId}/viewscores`)}>
            <FontAwesomeIcon icon={faChartBar} className="icon" />
            <span>View Scores</span>
          </div>
          <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentId}/viewreports`)}>
            <FontAwesomeIcon icon={faFileAlt} className="icon" />
            <span>View Reports</span>
          </div>
          <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentId}/viewdelayedjobs`)}>
            <FontAwesomeIcon icon={faClock} className="icon" />
            <span>View Delayed Jobs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtcTab;

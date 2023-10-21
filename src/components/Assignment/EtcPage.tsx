import React from 'react';
import BasicExample from './BasicExample';
import PersonIcon from '@mui/icons-material/Person';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import Groups3Icon from '@mui/icons-material/Groups3';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScoreIcon from '@mui/icons-material/Score';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function EtcPage() {
  const tester = {
    1: ["Add Participant", <PersonIcon />],
    2: ["Create Teams", <Groups3Icon />],
    3: ["Assign Reviewer", <AssignmentIndIcon />],
    4: ["View Submissions", <AssignmentIcon />],
    5: ["View Scores", <ScoreIcon />],
    6: ["View Reports", <SummarizeIcon />],
    7: ["View Delayed Jobs", <AccessTimeIcon />],
  }


  return (
    <div className="container">
      <div className="row">
        {Object.entries(tester).map(([key, value]) => (
          <div className="col-md-3 mt-2" key={key}>
            <BasicExample name={value[0] as string} icon={value[1] as JSX.Element} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default EtcPage;
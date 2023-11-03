import React from 'react';
import {Card, Col, Row} from 'react-bootstrap';
import { Link } from "react-router-dom";
import BasicExample from '../../components/Assignment/BasicExample';
import PersonIcon from '@mui/icons-material/Person';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import Groups3Icon from '@mui/icons-material/Groups3';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScoreIcon from '@mui/icons-material/Score';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function EtcPage() {
  const EtcMenu = {
    1: ["Add Participant", <PersonIcon />, "etc/participants"],
    2: ["Create Teams", <Groups3Icon />, "etc/teams"],
    3: ["Assign Reviewer", <AssignmentIndIcon />, "etc/assignReviewer"],
    4: ["View Submissions", <AssignmentIcon />, "etc/submissions"],
    5: ["View Scores", <ScoreIcon />, "etc/scores"],
    6: ["View Reports", <SummarizeIcon />, "etc/reports"],
    7: ["View Delayed Jobs", <AccessTimeIcon />, "etc/delayed"],
  }


  return (
    <Row xs={1} s={3} md={6} className="g-3">
        {Object.entries(EtcMenu).map(([key, value]) => (
          <Col key={key}>
            <Link to={value[2] as string}>
              <BasicExample name={value[0] as string} icon={value[1] as JSX.Element} />
            </Link>
          </Col>
        ))}
    </Row>
  );
}

export default EtcPage;
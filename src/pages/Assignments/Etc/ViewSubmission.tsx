import React from 'react';

type Props = {};

const ViewSubmission = (props: Props) => {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4">
          <div style={{fontWeight:'bold'}}className="column-header">Team name</div>
        </div>
        <div className="col-md-4">
          <div style={{fontWeight:'bold'}}className="column-header">Team member(s)</div>
        </div>
        <div className="col-md-4">
          <div style={{fontWeight:'bold'}}className="column-header">Links</div>
        </div>
        <hr /> 
      </div>
      
      <p>
        **In "Team name" column, text in 
        <span style={{ color: 'blue', fontStyle: 'italic' }}> blue</span> indicates that the submission grade is not assigned; 
        text in 
        <span style={{ color: 'brown', fontStyle: 'italic' }}> brown</span> indicates that the submission grade has been assigned.
      </p>
      
    </div>
  );
}

export default ViewSubmission;

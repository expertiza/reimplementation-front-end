import React from 'react';

type Props = {};

const AssignReviews = (props: Props) => {
  return (
    <>
    <div className="container">
      <div className="assign-reviews-container">
        <h1>Participants</h1>
        <div className="assignment-header">
        <h3>Assignment: Copy of Program 2</h3>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="column contributor">
              <div style={{ fontWeight: 'bold'}} className="column-header">Contributor</div>
              <div className="column-content">
                {/*Contributor content*/}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="column reviewed-by">
              <div style={{fontWeight: 'bold'}}className="column-header">Reviewed by</div>
              <div className="column-content">
                {/*Reviewed by content*/}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="column metareviewed-by">
              <div style={{fontWeight: 'bold'}}className="column-header">Metareviewed by</div>
              <div className="column-content">
                {/*Metareviewed by content*/}
              </div>
            </div>
          </div>
        </div>
        <div className="contributor-links">
            {[
              "Import reviewer mappings",
              "Import metareviewer mappings",
              "Export review mappings",
              "Export metareview mappings",
              "Back",
            ].map((link, index, array) => (
              <React.Fragment key={index}>
                <a style={{color: 'brown'}}href="#">{link}</a>
                {index < array.length - 1 ? ' | ' : null}
              </React.Fragment>
            ))}
          </div>
      </div>
    </div>
    </>
  );
}

export default AssignReviews;


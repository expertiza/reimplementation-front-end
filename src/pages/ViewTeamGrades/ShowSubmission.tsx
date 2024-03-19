import React, { useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';

const ShowSubmission = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(!open)}
        aria-controls="example-collapse-text"
        aria-expanded={open}
      >
        Show Submission
      </Button>
      <Collapse in={open}>
        <div id="example-collapse-text">
          <br></br>

          {open && (  // Render links only when open is true
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
            </>
          )}
        </div>
      </Collapse>
    </>
  );
};

export default ShowSubmission;

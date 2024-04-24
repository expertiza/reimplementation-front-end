import { Table } from "react-bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Reviews.css";
import { useNavigate } from "react-router-dom";
import { getReviewItems, getFeedbackItems, ReviewItem } from "./reviewData"; // Import function and interface

import { Row, Col, Button, Modal } from "react-bootstrap";
import { BsEnvelopeFill, BsEyeFill, BsEyeSlashFill, BsShareFill, BsTrashFill, BsCheck, BsX, BsFileEarmarkArrowUp} from "react-icons/bs";

type HandleMethod = () => void;

const Reviews: React.FC = () => {
  const [showReview, setShowReview] = useState<boolean>(true);
  const [showReviewSecond, setShowReviewSecond] = useState<boolean>(true);
  const [showSubmissions, setshowSubmissions] = useState<boolean>(true);

  const navigate = useNavigate();
  const [reviewSetId, setReviewSetId] = useState<string>("1"); // Default set ID
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<ReviewItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [showWarning, setShowWarning] = useState(false);
  const [warningSuccessFunc, setWarningSuccessFunc] = useState<HandleMethod | null>(null);
  const [warningPrompt, setWarningPrompt] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleShowWarning = (promptText: string, customFn?: HandleMethod) => {
    setWarningPrompt(promptText);
    setShowWarning(true);
    if (customFn) {
      setWarningSuccessFunc(() => customFn);
    }
  };

  const handleCloseWarning = () => {
    setShowWarning(false);
    setWarningSuccessFunc(null);
    setWarningPrompt("");
  };

  const handleCancelWarning = () => {
    setShowWarning(false);
    setWarningSuccessFunc(null);
    setWarningPrompt("");
  };

  const handleConfirmWarning = () => {
    if (warningSuccessFunc) {
      warningSuccessFunc();
    }
    setShowWarning(false);
    setWarningSuccessFunc(null);
    setWarningPrompt("");
  };

  const [links, setLinks] = useState([
    "https://github.ncsu.edu/npatil2/CSC517_Program2",
    "http://152.7.177.84:8080/"
  ]);

  const removeLink = (index: number) => {
    setLinks(prevLinks => prevLinks.filter((_, i) => i !== index));
  }

  useEffect(() => {
    console.log('Component mounted or reviewSetId changed');
    const items = getReviewItems(reviewSetId);
    const feedback = getFeedbackItems(reviewSetId);
    setReviewItems(items);
    setFeedbackItems(feedback);
  }, [reviewSetId]);  // Make sure reviewSetId is managed correctly

  if (!reviewItems.length) {
    console.log('No review items to display');
    return <div>No reviews available.</div>;
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileList = Array.from(files); // Convert FileList to array
      setSelectedFiles(prevFiles => [...prevFiles, ...fileList]);
      event.target.value = ''; // Allowing for duplicate files
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleShareReview = () => {
    console.log("Handle Share Review");
  };

  const getScoreColor = (score: number) => {
    switch (score) {
      case 5:
        return 'green';
      case 4:
        return 'lightgreen';
      case 3:
        return 'yellow';
      case 2:
        return 'orange';
      case 1:
        return 'pink';
      case 0:
        return 'red';
      default:
        return 'black';
    }
  };

  const handleFileUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="centered-container">
      <h1>Review for Program 2</h1>
      <br/>
      <Modal show={showWarning} onHide={handleCloseWarning}>
        <Modal.Header closeButton>
          <Modal.Title>Warning!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {warningPrompt}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleCancelWarning}>
            <BsX />
          </Button>
          <Button variant="success" onClick={handleConfirmWarning}>
            <BsCheck />
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Row className="side-by-side-container">
        <Col xs={12} md={6} className="action-container">
          <Row className="reviewTable">
            <Col xs={12}>
              <div className="tableButton">
                <Button title="Toggle Visibility" onClick={() => setshowSubmissions(!showSubmissions)}>
                  {showSubmissions ? <BsEyeFill /> : <BsEyeSlashFill />}
                  {showSubmissions  ? <span style={{ paddingLeft: "5px" }}>Hide Links</span> :
                    <span style={{ paddingLeft: "5px" }}>Show Links</span>}
                </Button>
              </div>

            </Col>
          </Row>
          <Table striped bordered>
            <tbody>
              <tr>
                <td>
                  <h4>Link Submissions</h4>
                </td>
              </tr>
              {showSubmissions && (
                links.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="trash-link-wrapper">
                        <div className="trash-button">
                          <Button size="sm" title="Remove Link" variant="danger" onClick={
                            () => handleShowWarning(`Are you sure you want to remove the link '${item}'?`, () => removeLink(index))
                          }>
                            <BsTrashFill />
                          </Button>
                        </div>
                        
                        <a href={item}>{item}</a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Col>

        <Col xs={12} md={6} className="action-container">
          <Row className="reviewTable">
            <Col xs={12}>
              
              <div className="tableButton">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }} // Hide the default file input
                    ref={fileInputRef}
                  />
                <Button variant="info" title="Submit File" onClick={handleFileUploadButtonClick}>
                  <BsFileEarmarkArrowUp />
                  <span style={{ paddingLeft: "5px" }}>Submit File</span>
                </Button>
              </div>
            </Col>
          </Row>
          <Table striped bordered>
            <thead>
              <tr>
                <th colSpan={3} style={{backgroundColor:"##f2f2f2"}}><h4 >File Submissions</h4></th>
              </tr>
              <tr>
                <th>File Name</th>
                <th>File Size</th>
                <th>File Type</th>
              </tr>
            </thead>
            <tbody>
            {
              selectedFiles.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="trash-link-wrapper">
                      <div className="trash-button">
                        <Button size="sm" title="Remove File" variant="danger" onClick={
                          () => handleShowWarning(`Are you sure you want to remove the file '${item.name}'?`, () => handleRemoveFile(index))
                        }>
                          <BsTrashFill />
                        </Button>
                      </div>

                      {item.name}
                    </div>
                  </td>
                  <td>
                    {item.size}
                  </td>
                  <td>
                    {item.type}
                  </td>
                </tr>
              ))
            }
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row className="reviewTable">
        <Col xs={12}>
          <div className="tableButton">
            <Button title="Toggle Visibility" onClick={() => setShowReview(!showReview)}>
              {showReview ? <BsEyeFill /> : <BsEyeSlashFill />}
              {showReview ? <span style={{ paddingLeft: "5px" }}>Hide Review</span> :
                <span style={{ paddingLeft: "5px" }}>Show Review</span>}

            </Button>
          </div>

          <div className="tableButton">
            <Button title="Email Author" variant="warning" onClick={() => navigate("../email_the_author")}>
              <BsEnvelopeFill />
              <span style={{ paddingLeft: "5px" }}>Email Author </span>
            </Button>
          </div>

          <div className="tableButton">
            <Button title="Share My Review" variant="info" onClick={
              () => handleShowWarning("Your review may now be available for other students to view. Are you sure?", () => handleShareReview)
            }>
              <BsShareFill /> <span style={{ paddingLeft: "5px" }}>Share My Review </span>
            </Button>
          </div>

        </Col>
        <span style={{ textAlign: "right" }}><strong>Last Reviewed:</strong> Sunday February 25 2024, 08:27PM</span>
      </Row>

      <Row className="reviewTable">
        <Col xs={12}>
          <Table striped bordered>
            <tbody>
              <tr>
                <td>
                  <h3 className="tableTitle">Software Engineering and Testing</h3>
                </td>
              </tr>
              {showReview && (
                reviewItems.map((item) => (
                  <tr key={item.id}>
                    <div style={{background: item.id % 2 == 0 ? "#D9EDF7" : "#FCF8E3"}}>
                      <td>
                        <h5><span>{item.id}. {item.question}</span></h5>
                        <div className="score-comment-wrapper">
                          <span className="score" style={{ backgroundColor: getScoreColor(item.score) }}>
                            {`${item.score}`}
                          </span>
                          <p className="comment" style={{padding:"10px"}}>{item.comment}</p>
                        </div>
                      </td>
                    </div>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
      <br/>
      <br/>
      <br/>

      <Row className="reviewTable">

        <div className="tableButton">
          <Button title="Toggle Visibility" onClick={() => setShowReviewSecond(!showReviewSecond)}>
            {showReviewSecond ? <BsEyeFill /> : <BsEyeSlashFill />}
            {showReviewSecond ? <span style={{ paddingLeft: "5px" }}>Hide Review</span> :
              <span style={{ paddingLeft: "5px" }}>Show Review</span>}

          </Button>
        </div>

        <span style={{ textAlign: "right" }}><strong>Last Reviewed:</strong> Sunday February 25 2024, 08:27PM</span>
      </Row>
      <Row className="reviewTable">
        <Col xs={12}>
          <Table striped bordered>
            <tbody>
            <tr>
              <td>
                <h3 className="tableTitle">FeedBack from the Author</h3>
              </td>
            </tr>
            {showReviewSecond && (
              feedbackItems.map((item) => (
                <tr key={item.id}>
                <div style={{background: item.id % 2 == 0 ? "#D9EDF7" : "#FCF8E3"}}>
                    <td>
                      <h5><span>{item.id}. {item.question}</span></h5>
                      <div className="score-comment-wrapper">
                          <span className="score" style={{ backgroundColor: getScoreColor(item.score) }}>
                            {`${item.score}`}
                          </span>
                        <p className="comment" style={{padding:"10px"}}>{item.comment}</p>
                      </div>
                    </td>
                  </div>
                </tr>
              ))
            )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
};

export default Reviews;
import { Table } from "react-bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Reviews.css";
import { useNavigate } from "react-router-dom";
import { getReviewItems, ReviewItem } from "./reviewData"; // Import function and interface

const Reviews: React.FC = () => {
  const [showReview, setShowReview] = useState<boolean>(true);
  const [selectedHyperlink, setSelectedHyperlink] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [shareReview, setShareReview] = useState<boolean>(false);
  const navigate = useNavigate();
  const [reviewSetId, setReviewSetId] = useState<string>("1"); // Default set ID
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);

  useEffect(() => {
    console.log('Component mounted or reviewSetId changed');
    const items = getReviewItems(reviewSetId);
    setReviewItems(items);
  }, [reviewSetId]);  // Make sure reviewSetId is managed correctly

  if (!reviewItems.length) {
    console.log('No review items to display');
    return <div>No reviews available.</div>;
  }

  const handleHyperlinkDelete = () => {
    setSelectedHyperlink(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file: { size: number; name: string; lastModified: number; type: string } = {
        name: event.target.files[0].name,
        size: event.target.files[0].size,
        type: event.target.files[0].type,
        lastModified: event.target.files[0].lastModified,
      };
      // @ts-ignore
      setUploadedFile(file);
    }
  };

  const handleFileDelete = () => {
    setUploadedFile(null);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setShareReview(false);
  };

  const handleShareReviewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShareReview(event.target.checked);
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

  return (
    <div>
      <h2>Review for Program 2</h2>
      <>
        <div>
          <div>
            <h3>Hyperlink Actions:</h3>
            <button disabled={!selectedHyperlink} onClick={handleHyperlinkDelete}>
              Delete selected hyperlink
            </button>
            <div>
              <span>hide links</span>
              <div>
                <input type="radio" name="hyperlinks" value="https://github.ncsu.edu/npatil2/CSC517_Program2" checked />
                <label><a href="https://github.ncsu.edu/npatil2/CSC517_Program2"
                          target="_blank">https://github.ncsu.edu/npatil2/CSC517_Program2</a></label>
              </div>
              <div>
                <input type="radio" name="hyperlinks" value="http://152.7.177.84:8080/" />
                <label><a href="http://152.7.177.84:8080/"
                          target="_blank">http://152.7.177.84:8080/</a></label>
              </div>
            </div>
          </div>

          <div>
            <h3>Email the Author:</h3>
              <button onClick={() => navigate("../email_the_author")}>Email Author</button>
          </div>
        </div>


        <div>
          <h3>Submit a file:</h3>
          <div>
            <input type="file" onChange={handleFileUpload} />
            <button>Upload file</button>
          </div>
        </div>
        <div>
          <h3>File actions:</h3>
          <button disabled={!uploadedFile} onClick={handleFileDelete}>
            Delete selected file
          </button>
          <button onClick={handleReset}>Reset</button>
        </div>
        {uploadedFile && (
          <div>
            <h3>Name</h3>
            <h3>Size</h3>
            <h3>Type</h3>
            <h3>Date Modified</h3>
            <div>
              <input type="radio" name="file" value={uploadedFile.name} defaultChecked />
              <label>{uploadedFile.name}</label>
              <span>{uploadedFile.size}</span>
              <span>{uploadedFile.type}</span>
              <span>{uploadedFile.lastModified}</span>
            </div>
          </div>
        )}
        <div>
          <input type="checkbox" checked={shareReview} onChange={handleShareReviewChange} />
          <label>I agree to share my review as a sample for others</label>
        </div>
        <br />
        <br />

        
        <div className="reviewTable">
          <a href="#" onClick={() => setShowReview(!showReview)}>
            {showReview ? 'Hide Review' : 'Show Review'}
          </a>
          <div>
            <Table striped bordered hover>
              <tbody>
                <tr>
                  <td>
                    <h4>Software Engineering and Testing</h4>
                  </td>
                </tr>
                {showReview && (
                  reviewItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <h6>{item.question}</h6>
                        <div className="score-comment-wrapper">
                          <span className="score" style={{ backgroundColor: getScoreColor(item.score) }}>
                            {`${item.score}`}
                          </span>
                          <p className="comment">{item.comment}</p>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </>
    </div>
  );
};


export default Reviews;

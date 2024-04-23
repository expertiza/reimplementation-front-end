import { Table } from "react-bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Reviews.css";
import { useNavigate } from "react-router-dom";
import { getReviewItems, ReviewItem } from "./reviewData"; // Import function and interface
//
// interface ReviewItem {
//   id: number;
//   question: string;
//   score: number;
//   comment: string;
// }

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
  // const reviewItems: ReviewItem[] = [
  //   {
  //     id: 1,
  //     question: 'The code is written in a clean and readable way. (Mention any relevant details.) [Max points: 5]',
  //     score: 5,
  //     comment: 'The code has a clear structure with appropriate indentation and spacing. It is easy to visually parse and understand the code\'s flow. There are appropriate comments where expected\n\nJust one negative point: Quite a lot dead(commented out) code is present. This could have been removed in a refactor',
  //   },
  //   {
  //     id: 2,
  //     question: 'Each method is performing only one task. (One method should only handle one task, if there are multiple tasks, there should be function calls. Mention any relevant details.) [Max points: 5]',
  //     score: 5,
  //     comment: '',
  //   },
  //   {
  //     id: 3,
  //     question: 'Variable and method names are indicative of what the variables are storing/handling. (Mention any relevant details.) [Max points: 5]',
  //     score: 5,
  //     comment: '',
  //   },
  //   {
  //     id: 4,
  //     question: 'Commit messages are indicative of what changes were made in the commit. (Mention any relevant details.) [Max points: 5]',
  //     score: 3,
  //     comment: 'Most of the messages are good, but there are some commits which add multiple unrelated changes and their message is not clearly indicative of the change.\n\nFor example: "Added Room Booking Part" has a lot of file changes, and it is not clear if the commit added event creation or ticket booking feature.',
  //   },
  //   {
  //     id: 5,
  //     question: 'This system works as it is supposed to. (If you found any problems in the first round, did the authors fix them? Comment on any functionality that is still failing.) [Max points: 5]',
  //     score: 3,
  //     comment: 'Some issues mentioned in round 1 that were not fixed:\n\n1) URL manipulation:\nI was able to edit the review written by another attendee by manipulating the URL\nI was able to delete a room as an attendee\n\n2) In ReviewIndex view, filtering is done based on user email. But user email is not visible in each review, hence it is not clear if the filter was succesfully applied\n\n3) The project document mentions that every instance of event ticket must have its own confirmation number. But when I purchase bulk tickets, all of them are having the same confirmation number',
  //   },
  //   {
  //     id: 6,
  //     question: 'This team made commits in round 2.',
  //     score: 0,
  //     comment: '',
  //   },
  //   {
  //     id: 7,
  //     question: 'The README file contains all the information needed, and the code is well documented, with adequate comments to explain the coding. [Max points: 5]',
  //     score: 5,
  //     comment: 'The README is exceptionally detailed and contains all the required information. Great job!',
  //   },
  //   {
  //     id: 8,
  //     question: 'Has the testing been done properly for at least one model? [Max points: 5]',
  //     score: 5,
  //     comment: '',
  //   },
  //   {
  //     id: 9,
  //     question: 'Has the testing been done properly for at least one controller? [Max points: 5]',
  //     score: 5,
  //     comment: '',
  //   },
  // ];

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

        <span> <strong>Review</strong>
        <a style={{ "padding": "10px", }} href="#" onClick={() => setShowReview(!showReview)}>
          {showReview ? "hide review" : "show review"}
        </a></span>
        {showReview && (
          <div>

            <Table striped bordered hover>
              <tbody>
              <tr>
                <td><h4>Software Engineering and Testing</h4></td>
              </tr>
              {reviewItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <h6>{item.question}</h6>
                    <span className="score-wrapper">
                      <span className="score"
                            style={{ backgroundColor: getScoreColor(item.score) }}>{`${item.score}`}</span>
                      <p style={{ "paddingLeft": "5px", }}>{item.comment}</p>
                    </span>
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
        )}
      </>

    </div>
  );
};


export default Reviews;

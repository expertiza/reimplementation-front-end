import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import { ICourseResponse as ICourse } from "../../utils/interfaces";

/**
 * @author Aniket Singh Shaktawat, on March, 2024 
 * @author Pankhi Saini on March, 2024
 * @author Siddharth Shah on March, 2024
 */

// CopyCourse Component: Modal for copying a course.

interface ICopyCourse {
  courseData: ICourse;
  onClose: () => void;
}

const CopyCourse: React.FC<ICopyCourse> = ({ courseData, onClose }) => {
  // State and hook declarations
  const { data: copiedCourse, error: courseError, sendRequest: CopyCourse } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

  // Function to initiate the course copy process
  const copyHandler = () =>
    CopyCourse({ url: `/courses/${courseData.id}/copy`, method: HttpMethod.GET });

  // Show error if any
  useEffect(() => {
    if (courseError) dispatch(alertActions.showAlert({ variant: "danger", message: courseError }));
  }, [courseError, dispatch]);

  // Close modal if course is copied
  useEffect(() => {
    if (copiedCourse?.status && copiedCourse?.status >= 200 && copiedCourse?.status < 300) {
      setShow(false);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Course ${courseData.name} copied successfully!`,
        })
      );
      onClose();
    }
  }, [copiedCourse?.status, dispatch, onClose, courseData.name]);

  // Function to close the modal
  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  // Render the CopyCourse modal
  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Copy Course</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to copy course <b>{courseData.name}?</b>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={closeHandler}>
          Cancel
        </Button>
        <Button variant="outline-primary" onClick={copyHandler}>
          Copy
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CopyCourse;

import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import { ICourseResponse as ICourse } from "../../utils/interfaces";
import { useTranslation } from "react-i18next";

/**
 * @author Atharva Thorve, on December, 2023
 * @author Mrityunjay Joshi on December, 2023
 */

// CopyCourse Component: Modal for copying a course.

interface ICopyCourse {
  courseData: ICourse;
  onClose: () => void;
}

const CopyCourse: React.FC<ICopyCourse> = ({ courseData, onClose }) => {
  const { t } = useTranslation(); 
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
          message: t('courses.copy.success_message', { courseName: courseData.name }),
        })
      );
      onClose();
    }
  }, [copiedCourse?.status, dispatch, onClose, courseData.name, t]);

  // Function to close the modal
  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  // Render the CopyCourse modal
  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>{t('courses.copy.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {t('courses.copy.confirm_message')} <b>{courseData.name}?</b>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={closeHandler}>
          {t('courses.copy.cancel')}
        </Button>
        <Button variant="outline-primary" onClick={copyHandler}>
          {t('courses.copy.copy')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CopyCourse;

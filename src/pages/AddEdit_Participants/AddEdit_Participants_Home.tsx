import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { Button, Col, Container, Row, Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsPersonFillAdd } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "../../store/store";
import { IUserResponse, ROLE } from "../../utils/interfaces";
import DeleteUser from "./AddEdit_Participant_Delete";
import { userColumns as USER_COLUMNS } from "./AddEdit_Participant_Columns";
import dummyUsers from "./dummyUsers.json";

type User = {
  id: number;
  name: string;
  email: string;
  full_name: string;
  email_on_review: boolean;
  email_on_submission: boolean;
  email_on_review_of_review: boolean;
  parent: {
    id: null | number;
    name: null | string;
  };
  institution: {
    id: number | null;
    name: string | null;
  };
  role: {
    id: null | number;
    name: string;
  };
  take_quiz: boolean;
};

const Users = () => {
  const [userLogin, setUserLogin] = useState("");
  const [role, setRole] = useState("participant");
  const [localUsers, setLocalUsers] = useState<User[]>(dummyUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null); // State for the editing user
  const [showEditModal, setShowEditModal] = useState(false); // Control edit popup
  const dispatch = useDispatch();

  const auth = useSelector((state: RootState) => state.authentication);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IUserResponse;
  }>({ visible: false });
  const checkStatus = (users: User[]) => {
    const takeQuizValues = users.map(user => user.take_quiz);
    const allTrueQuiz = takeQuizValues.every(value => value === true);
    const allFalseQuiz = takeQuizValues.every(value => value === false);
    const reviewValues = users.map(user => user.email_on_review);
    const allTrueReview = reviewValues.every(value => value === true);
    const allFalseReview = reviewValues.every(value => value === false);
    const takeSubmitValues = users.map(user => user.email_on_submission);
    const allTrueSubmit = takeSubmitValues.every(value => value === true);
    const allFalseSubmit = takeSubmitValues.every(value => value === false);

    return {
      showQuizColumn: !(allTrueQuiz || allFalseQuiz), // Show column if there are mixed values
      allTrueQuiz, 
      showReviewColumn: !(allTrueReview || allFalseReview), // Show column if there are mixed values
      allTrueReview, 
      showSubmitColumn: !(allTrueSubmit || allFalseSubmit), // Show column if there are mixed values
      allTrueSubmit,
    };
  };
  
  const { showQuizColumn, showReviewColumn, showSubmitColumn, allTrueQuiz, allTrueSubmit, allTrueReview  } = useMemo(() => checkStatus(localUsers), [localUsers]);
  const handleAddUser = () => {
    if (!userLogin || !role) {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: "Please enter a user login and select a role.",
        })
      );
      return;
    }

    const newUser: User = {
      id: new Date().getTime(),
      name: userLogin,
      email: `${userLogin}@example.com`,
      full_name: userLogin,
      email_on_review: false,
      email_on_submission: false,
      email_on_review_of_review: false,
      parent: { id: 101, name: null },
      institution: { id: 123, name: null },
      role: { id: 1, name: role },
      take_quiz: false,
    };

    setLocalUsers((prevUsers: User[]) => [...prevUsers, newUser]);

    dispatch(
      alertActions.showAlert({
        variant: "success",
        message: `User ${userLogin} added successfully!`,
      })
    );

    setUserLogin("");
    setRole("");
  };
  const onDelete = (userId: number) => {
    setLocalUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };
  const onEditHandle = useCallback(
    (row: TRow<IUserResponse>) => {
      if (!row.original) {
        console.error("Row data is undefined");
        return;
      }
      setEditingUser(row.original as User); // Set the editing user data
      setShowEditModal(true); // Show the edit modal
    },
    []
  );

  const onSaveEdit = (updatedUser: User) => {
    // Update the user in the state
    setLocalUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    setShowEditModal(false); // Close the modal
    dispatch(
      alertActions.showAlert({
        variant: "success",
        message: `User ${updatedUser.name} updated successfully!`,
      })
    );
  };
  const onDeleteHandle = useCallback(
    (row: TRow<IUserResponse>) =>
      setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );
  const tableData: IUserResponse[] = useMemo(() => {
    return localUsers.map((user) => ({
      ...user,
      role: {
        ...user.role,
        id: user.role.id ?? 0,
      },
    }));
  }, [localUsers]);

  const tableColumns = useMemo(() => {
    const columns = USER_COLUMNS(onEditHandle, onDeleteHandle, tableData);
  
    // Conditionally filter out columns based on the flags (showReviewColumn, showSubmitColumn, showQuizColumn)
    let filteredColumns = columns;
  
    // Filter out "email_on_review" column if showReviewColumn is false
    if (!showReviewColumn) {
      filteredColumns = filteredColumns.filter(column => {
        return !(column as any).accessorKey || (column as any).accessorKey !== "email_on_review";
      });
    }
  
    // Filter out "take_quiz" column if showSubmitColumn is false
    if (!showSubmitColumn) {
      filteredColumns = filteredColumns.filter(column => {
        return !(column as any).accessorKey || (column as any).accessorKey !== "email_on_submission";
      });
    }
  
    // Filter out "take_quiz" column again if showQuizColumn is false
    if (!showQuizColumn) {
      filteredColumns = filteredColumns.filter(column => {
        return !(column as any).accessorKey || (column as any).accessorKey !== "take_quiz";
      });
    }
  
    // Return the filtered columns
    return filteredColumns;
    return USER_COLUMNS(onEditHandle, () => {}, tableData);
  }, [showReviewColumn, showSubmitColumn, showQuizColumn, onEditHandle, onDeleteHandle, tableData]);
  const closeDeleteModal = () => {
    setShowDeleteConfirmation({ visible: false });
  };
  const renderTooltip = (text: string) => (
    <Tooltip id={`tooltip-${text}`}>{text}</Tooltip>
  );
  return (
    <>
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Participants for CSC/ECE 517 - Object Oriented Design and Development</h1>
            </Col>
            <hr />
          </Row>
          <Row className="mb-3">
            <Col md={2}>
              <Form.Control
                type="text"
                placeholder="Enter a username"
                value={userLogin}
                onChange={(e) => setUserLogin(e.target.value)}
              />
            </Col>
            <Col md={6} className="d-flex align-items-center">
              <div className="d-flex align-items-center">
                <Form.Check
                  inline
                  style={{ marginRight: '15px' }} // Adds space between radio buttons
                  label={
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(
                        "A Participant is someone who actively participates in tasks or events."
                      )}
                    >
                      <span>Participant</span>
                    </OverlayTrigger>
                  }
                  name="role"
                  type="radio"
                  value="participant"
                  checked={role === "participant"}
                  onChange={() => setRole("participant")}
                />
                <Form.Check
                  inline
                  style={{ marginRight: '15px' }} // Adds space between radio buttons
                  label={
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(
                        "A Reader is someone with read-only access to content."
                      )}
                    >
                      <span>Reader</span>
                    </OverlayTrigger>
                  }
                  name="role"
                  type="radio"
                  value="reader"
                  checked={role === "reader"}
                  onChange={() => setRole("reader")}
                />
                <Form.Check
                  inline
                  style={{ marginRight: '15px' }} // Adds space between radio buttons
                  label={
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(
                        "A Reviewer provides feedback or evaluation on tasks or submissions."
                      )}
                    >
                      <span>Reviewer</span>
                    </OverlayTrigger>
                  }
                  name="role"
                  type="radio"
                  value="reviewer"
                  checked={role === "reviewer"}
                  onChange={() => setRole("reviewer")}
                />
                <Form.Check
                  inline
                  style={{ marginRight: '15px' }} // Adds space between radio buttons
                  label={
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(
                        "A Submitter is someone responsible for submitting work."
                      )}
                    >
                      <span>Submitter</span>
                    </OverlayTrigger>
                  }
                  name="role"
                  type="radio"
                  value="submitter"
                  checked={role === "submitter"}
                  onChange={() => setRole("submitter")}
                />
                <Form.Check
                  inline
                  style={{ marginRight: '15px' }} // Adds space between radio buttons
                  label={
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(
                        "A Mentor provides guidance and support to other users."
                      )}
                    >
                      <span>Mentor</span>
                    </OverlayTrigger>
                  }
                  name="role"
                  type="radio"
                  value="mentor"
                  checked={role === "mentor"}
                  onChange={() => setRole("mentor")}
                />
              </div>
            </Col>
            <Col className="d-flex justify-content-end">
              <Button variant="primary" onClick={handleAddUser}>
                <BsPersonFillAdd className="me-2" />
                Add User
              </Button>
            </Col>
          </Row>
          <Table 
          data={tableData} 
          columns={tableColumns}
          columnVisibility={{
            id: false,
            institution: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
          }}
           />
        </Container>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formEditName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="formEditEmail" className="mt-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </Form.Group>
              {/* Add more fields as needed */}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => onSaveEdit(editingUser)}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {/* </main> */}
      {/* Render your table and pass the delete modal */}
      {showDeleteConfirmation.visible && showDeleteConfirmation.data && (
        <DeleteUser
          userData={showDeleteConfirmation.data}
          onClose={closeDeleteModal}
          onDelete={onDelete} // Pass the callback
        />
      )}
    </>
  );
};

export default Users;

import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
// import useAPI from "hooks/useAPI";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
// import { Button, Col, Container, Row, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsPersonFillAdd } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "../../store/store";
import { IUserResponse, ROLE } from "../../utils/interfaces";
import DeleteUser from "./AddEdit_Participant_Delete";
import { userColumns as USER_COLUMNS } from "./AddEdit_Participant_Columns";
import dummyUsers from './dummyUsers.json';
import UserEditor from "./AddEdit_Participants_Editor";

// Define the User type
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
/**
 * @author Ankur Mundra on April, 2023
 */
const Users = () => {
  const [userLogin, setUserLogin] = useState("");
  const [role, setRole] = useState("participant");
  const [localUsers, setLocalUsers] = useState<User[]>(dummyUsers);
  // const { error, isLoading, data: userResponse, sendRequest: fetchUsers } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

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
      allTrueSubmit,                            // Indicates if all are true                           // Indicates if all are true                           // Indicates if all are true
    };
  };
  
  const { showQuizColumn, showReviewColumn, showSubmitColumn, allTrueQuiz, allTrueSubmit, allTrueReview  } = useMemo(() => checkStatus(localUsers), [localUsers]);


  const [userResponse, setUserResponse] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate data fetching on component mount
useEffect(() => {
  try {
    // Mimic a loading delay for better simulation of an API call
    setTimeout(() => {
      setUserResponse(dummyUsers as User[]);
      setIsLoading(false);
    }, 1000); // Adjust delay as needed
  } catch (err) {
    setIsLoading(false);
  }
}, []);

const validateUser = (user: any): user is User => {
  return (
    typeof user.id === "number" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.institution.id === "number" &&
    typeof user.role.id === "number"
  );
};

useEffect(() => {
  const validUsers = (dummyUsers as any[]).filter(validateUser);
  setUserResponse(validUsers);
  setIsLoading(false);
}, []);

useEffect(() => {
  if (!showDeleteConfirmation.visible) {
    setIsLoading(true); // Simulate the loading state
    setTimeout(() => {
      // Simulate fetching managed users
      const managedUsers = (dummyUsers as User[]).filter(user => user.id === auth.user.id);
      setUserResponse(prevState => [...prevState, ...managedUsers]); //Update state with managed users
      setIsLoading(false); // Loading complete
    }, 1000); // Simulate a delay
  }
}, [location, showDeleteConfirmation.visible, auth.user.id]);

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteUserHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);
  
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
  
    // Create the new user object with correct structure
    const newUser: User = {
      id: new Date().getTime(), // Generate a unique ID
      name: userLogin,
      email: `${userLogin}@example.com`,
      full_name: userLogin,
      email_on_review: false,
      email_on_submission: false,
      email_on_review_of_review: false,
      parent: { id: 101, name: null },  // This is valid as per the type
      institution: { id: 123, name: null },  // Ensure this matches the expected type
      role: { id: 1, name: role },  // Assuming role has the correct structure
      take_quiz: false
    };
  
    // Add the new user to the state
    setLocalUsers((prevUsers: User[]) => [...prevUsers, newUser]);
  
    // Show success alert
    dispatch(
      alertActions.showAlert({
        variant: "success",
        message: `User ${userLogin} added successfully!`,
      })
    );
  
    // Reset the user login and role fields
    setUserLogin("");
    setRole("");
  };
  

  const onDelete = (userId: number) => {
    setLocalUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  const onEditHandle = useCallback(
    (row: TRow<IUserResponse>) => {
      // Navigate to the editor with the user ID and mode as "update"
      navigate(`/users/edit/${row.original.id}`, { state: { mode: "update", userData: row.original } });
    },
    [navigate]
  );

  const handleDeleteUser = (userId: number) => {
    setLocalUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId)); // Update local state
  };

  const onDeleteHandle = useCallback(
    (row: TRow<IUserResponse>) =>
      setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableData: IUserResponse[] = useMemo(() => {
    return localUsers.map(user => ({
      ...user,
      role: {
        ...user.role,
        id: user.role.id ?? 0, // Ensure role.id is a number
      },
    }));
  }, [localUsers]);

  const tableColumns = useMemo(() => {
    // Get the initial columns from USER_COLUMNS
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
  }, [showReviewColumn, showSubmitColumn, showQuizColumn, onEditHandle, onDeleteHandle, tableData]);
  



  const closeDeleteModal = () => {
    setShowDeleteConfirmation({ visible: false });
  };

  const renderTooltip = (text: string) => (
    <Tooltip id={`tooltip-${text}`}>{text}</Tooltip>
  );

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Participants for CSE/ECE 517 - Object Oriented Design and Development</h1>
              {/* {allTrueQuiz && <p>All participants have taken the quiz.</p>} */}
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
              <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <Button variant="primary" onClick={handleAddUser} className="mt-3">
                <BsPersonFillAdd className="me-2" />
                Add User
              </Button>
            </Col>
          </Row>
            </Col>

            {/* Conditionally render the message only when all participants have taken the quiz */}
          {allTrueQuiz && (
            <Row className="mb-3">
              <Col className="text-center">
                <strong>All participants have taken the quiz</strong>
              </Col>
            </Row>
          )}

          {/* Conditionally render the note if all participants can submit*/}
          {allTrueSubmit && (
            <Row className="mb-3">
              <Col className="text-center">
                <strong>All participants can submit</strong>
              </Col>
            </Row>
          )}
          {/* Conditionally render the note if all participants can review */}
          {allTrueReview && (
            <Row className="mb-3">
              <Col className="text-center">
                <strong>All participants can review</strong>
              </Col>
            </Row>
          )}
            <Table
              data={tableData}
              columns={tableColumns}
              columnVisibility={{
                id: false,
                institution: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
              }}
            />
          </Row>
        </Container>
      </main>
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
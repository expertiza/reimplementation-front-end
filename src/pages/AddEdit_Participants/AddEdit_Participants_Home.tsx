import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsPersonFillAdd } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "../../store/store";
import { IUserResponse, ROLE } from "../../utils/interfaces";
import DeleteUser from "./AddEdit_Participant_Delete";
import { userColumns as USER_COLUMNS } from "./AddEdit_Participant_Columns";

/**
 * @author Ankur Mundra on April, 2023
 */
const Users = () => {
  const [userLogin, setUserLogin] = useState("");
  const [role, setRole] = useState("participant");
  const { error, isLoading, data: userResponse, sendRequest: fetchUsers } = useAPI();
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

  useEffect(() => {
    if (!showDeleteConfirmation.visible) fetchUsers({ url: `/users/${auth.user.id}/managed` });
  }, [fetchUsers, location, showDeleteConfirmation.visible, auth.user.id]);

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteUserHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);
  const handleAddUser = () => {
    // Logic to add the user, based on the userLogin and role values
    console.log("Adding user:", userLogin, role);
  };
  const onEditHandle = useCallback(
    (row: TRow<IUserResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IUserResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => USER_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );

  const tableData = useMemo(
    () => (isLoading || !userResponse?.data ? [] : userResponse.data),
    [userResponse?.data, isLoading]
  );

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
              <h1>Manage Users</h1>
            </Col>
            <hr />
          </Row>
          <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Enter a user login"
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
          </Row>
          <Row>
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
    </>
  );
};

export default Users;

import {useCallback, useEffect, useMemo, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {Button, Col, Container, Row} from "react-bootstrap";
import {userColumns as USER_COLUMNS} from "./userColumns";
import {Row as TRow} from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import {alertActions} from "store/slices/alertSlice";
import {useDispatch} from "react-redux";
import DeleteUser from "./UserDelete";
import {IUserResponse} from "./userUtil";
import {BsPersonFillAdd} from "react-icons/bs";

/**
 * @author Ankur Mundra on April, 2023
 */
const Users = () => {
  const { error, isLoading, data: userResponse, sendRequest: fetchUsers } = useAPI();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IUserResponse;
  }>({ visible: false });

  useEffect(() => {
    if (!showDeleteConfirmation.visible) fetchUsers({ url: "/users" });
  }, [fetchUsers, location, showDeleteConfirmation.visible]);

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteUserHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

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
          <Row>
            <Col md={{ span: 1, offset: 11 }}>
              <Button variant="outline-success" onClick={() => navigate("new")}>
                <BsPersonFillAdd />
              </Button>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteUser userData={showDeleteConfirmation.data!} onClose={onDeleteUserHandler} />
            )}
          </Row>
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              columnVisibility={{ id: false, institution: false }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Users;

import { Row as TRow } from "@tanstack/react-table";
import Table from "../../components/Table/Table";
import useAPI from "../../hooks/useAPI";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { BsPersonFillAdd } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "../../store/slices/alertSlice";
import { RootState } from "../../store/store";
import { IUserResponse, ROLE } from "../../utils/interfaces";
import DeleteUser from "./UserDelete";
import { userColumns as USER_COLUMNS } from "./userColumns";
import ImportModal from "../../components/Modals/ImportModal";
import ExportModal from "../../components/Modals/ExportModal";

/**
 * @author Ankur Mundra on April, 2023
 */
const Users = () => {
  const { error, isLoading, data: userResponse, sendRequest: fetchUsers } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const [showImportUserModal, setShowImportUserModal] = useState(false);
  const [showExportUserModal, setShowExportUserModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const STANDARD_TEXT: React.CSSProperties = {
    fontFamily: 'verdana, arial, helvetica, sans-serif',
    color: '#333',
    fontSize: '13px',
    lineHeight: '30px',
  };

  const toolbarLinkBase: React.CSSProperties = {
    ...STANDARD_TEXT,
    color: '#8b5e3c',
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    textDecoration: 'none',
  };
  const pipe: React.CSSProperties = { margin: '0 8px', color: '#8b5e3c' };

  const ToolbarLink: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ onClick, children }) => (
    <button style={toolbarLinkBase} onClick={onClick}>
      {children}
    </button>
  );

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
            <Col>
              <ToolbarLink onClick={() => setShowImportUserModal(true)}>Import users</ToolbarLink>
              <span style={pipe}>|</span>
              <ToolbarLink onClick={() => setShowExportUserModal(true)}>Export users</ToolbarLink>

            </Col>
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
              columnVisibility={{
                id: false,
                institution: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
              }}
            />
          </Row>
        </Container>
      </main>

      {/* Import / Export modals (from separate files) */}
      <ImportModal
        show={showImportUserModal}
        onHide={() => setShowImportUserModal(false)}
        modelClass="User"
      />
      <ExportModal
        show={showExportUserModal}
        onHide={() => setShowExportUserModal(false)}
        modelClass="User"
      />
    </>
  );
};

export default Users;

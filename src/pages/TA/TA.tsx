import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import { TAColumns as TA_COLUMNS } from "./TAColumns";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import { alertActions } from "store/slices/alertSlice";
import { useDispatch, useSelector } from "react-redux";
import DeleteTA from "./TADelete";
import { BsPersonFillAdd } from "react-icons/bs";
import { ITAResponse, ROLE } from "../../utils/interfaces";
import { RootState } from "../../store/store";

/**
 * @author Ankur Mundra on April, 2023
 */
const TAs = () => {
  const { error, isLoading, data: TAResponse, sendRequest: fetchTAs } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: ITAResponse;
  }>({ visible: false });

  useEffect(() => {
    if (!showDeleteConfirmation.visible) fetchTAs({ url: `/TAs/${auth.user.id}/managed` });
  }, [fetchTAs, location, showDeleteConfirmation.visible, auth.user.id]);

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteTAHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<ITAResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<ITAResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => TA_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );

  const tableData = useMemo(
    () => (isLoading || !TAResponse?.data ? [] : TAResponse.data),
    [TAResponse?.data, isLoading]
  );

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage TAs</h1>
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
              <DeleteTA TAData={showDeleteConfirmation.data!} onClose={onDeleteTAHandler} />
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
    </>
  );
};

export default TAs;

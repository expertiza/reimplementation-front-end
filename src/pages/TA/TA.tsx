// Importing necessary interfaces and modules

import { Row as TRow } from "@tanstack/react-table";
import Table from "../../components/Table/Table";
import useAPI from "../../hooks/useAPI";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import { BsPersonFillAdd } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { alertActions } from "../../store/slices/alertSlice";
import { RootState } from "../../store/store";
import { ITAResponse, ROLE } from "../../utils/interfaces";
import { TAColumns as TA_COLUMNS } from "./TAColumns";
import DeleteTA from "./TADelete";

/**
 * @author Atharva Thorve, on December, 2023
 * @author Divit Kalathil, on December, 2023
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
  const params = useParams();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: ITAResponse;
  }>({ visible: false });

  useEffect(() => {
    const { courseId } = params;
    // ToDo: This API in the backend is not working properly needs to be fixed.
    if (!showDeleteConfirmation.visible) fetchTAs({ url: `/courses/${courseId}/tas` });
  }, [fetchTAs, location, showDeleteConfirmation.visible, auth.user.id, params]);

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteTAHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onDeleteHandle = useCallback(
    (row: TRow<ITAResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => TA_COLUMNS(onDeleteHandle),
    [onDeleteHandle]
  );

  const tableData = useMemo(
    () => (isLoading || !TAResponse?.data ? [] : TAResponse.data),
    [TAResponse?.data, isLoading]
  );

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/courses");

  return (
    // Unable to use fullscreen modal with proper size breakdowns since the react-bootstrap version is below 5.
    // Therefore the max size is at xl.
    // ToDo: After dependency has been updated do change the size of the Modal.
    <Modal size="xl" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Manage TAs</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
              <Col md={{ span: 1, offset: 11 }} style={{paddingBottom: "10px"}}>
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
                showGlobalFilter={false}
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
      </Modal.Body>
    </Modal>
  );
};

export default TAs;

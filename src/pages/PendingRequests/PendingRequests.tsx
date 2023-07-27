import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Table from "components/Table/Table";
import { REQUEST_COLUMNS } from "./RequestColumns";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "hooks/useAPI";
import ModalComponent from "components/Modal";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";

const PendingRequests = () => {
  const [showCurrent, setCurrentData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<{ id: any } | null>({ id: null });
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const { error, isLoading, data: dataResponse, sendRequest: fetchData } = useAPI();
  const { sendRequest } = useAPI();
  const dispatch = useDispatch();

  useEffect(() => {
    let endpoint = showCurrent ? "pending" : "processed";
    fetchData({ url: "/account_requests/" + endpoint });
  }, [fetchData, showCurrent]);

  const showSearchBar = true;

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const handleAccept = async (row: { id: any }) => {
    setShowModal(true);
    let method: HttpMethod = HttpMethod.PUT;
    let url: string = "/account_requests/" + row.id;
    sendRequest({
      url: url,
      method: method,
      data: { status: "Approved" },
    });
    fetchData({ url: "/account_requests/pending" });
  };
  const handleReject = async (row: { id: any }) => {
    setShowModal(true);
    let method: HttpMethod = HttpMethod.PUT;
    let url: string = "/account_requests/" + row.id;
    sendRequest({
      url: url,
      method: method,
      data: { status: "Rejected" },
    });
    fetchData({ url: "/account_requests/pending" });
  };

  const triggerModal = async (row: { id: any }, action: "accept" | "reject") => {
    setSelectedRow(row);
    setAction(action);
    setShowModal(true);
  };
  const tableColumns = useMemo(() => REQUEST_COLUMNS(triggerModal, showCurrent), [showCurrent]);
  const tableData = useMemo(
    () => (isLoading || !dataResponse?.data ? [] : dataResponse.data),
    [dataResponse?.data, isLoading]
  );
  return (
    <Container>
      <Row className="mt-4">
        <Col md={1} className="d-flex justify-content-front">
          <Button onClick={() => setCurrentData(true)}>Current</Button>
          <Button
            onClick={() => {
              setCurrentData(false);
            }}
            className="ms-2"
          >
            History
          </Button>
        </Col>
        {isLoading ? (
          <>Loading...</>
        ) : (
          <Table data={tableData} columns={tableColumns} showGlobalFilter={showSearchBar} />
        )}
        <ModalComponent
          show={showModal}
          onClose={() => setShowModal(false)}
          title={
            action === "accept"
              ? "Accept Confirmation"
              : action === "reject"
              ? "Reject Confirmation"
              : "Modal Title"
          }
          body={
            action === "accept" ? (
              <p>Are you sure you want to Accept this user?</p>
            ) : action === "reject" ? (
              <p>Are you sure you want to Reject this user?</p>
            ) : (
              "Modal Body"
            )
          }
          footer={
            <>
              <Button
                variant="secondary"
                onClick={async () => {
                  if (selectedRow && action) {
                    if (action === "accept") {
                      await handleAccept(selectedRow); // Call handleAccept if action is "accept"
                    } else if (action === "reject") {
                      await handleReject(selectedRow); // Call handleReject if action is "reject"
                    }
                    setShowModal(false);
                    setAction(null); // Reset the action after handling the click
                  }
                }}
              >
                Confirm
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Close
              </Button>
            </>
          }
        />
      </Row>
    </Container>
  );
};
export default PendingRequests;

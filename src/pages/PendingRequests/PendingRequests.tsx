import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Table from "components/Table/Table";
import { REQUEST_COLUMNS } from "./RequestColumns";
import { IPendingTable } from "./util";
import axios from "axios";
import { Modal } from "react-bootstrap";

const PendingRequests = () => {
  const [showCurrent, setCurrentData] = useState(true);
  const [tableData, setTableData] = useState<Record<string, IPendingTable>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<{ id: any } | null>({ id: null });
  const [action, setAction] = useState<"accept" | "reject" | null>(null);

  useEffect(() => {
    fetchData();
  }, [showCurrent]);

  const fetchData = async () => {
    let endpoint = showCurrent ? "pending" : "processed";
    try {
      setLoading(true);

      const response = await axios.get(`http://127.0.0.1:3000/api/v1/account_requests/${endpoint}`); // Make a GET request to the 'pending_requests' endpoint
      const tableData: Record<string, any>[] = response.data.map((item: IPendingTable) => ({
        ...item,
      }));
      setTableData(tableData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error loading pending requests:", error);
    }
  };

  const showSearchBar = true;

  const handleAccept = async (row: { id: any }) => {
    setShowModal(true);
    try {
      console.log("Hi");
      await axios.put(`http://127.0.0.1:3000/api/v1/account_requests/${row.id}`, {
        status: "Approved",
      }); // Make a PUT request to the 'update' endpoint with status 'Approved'
      fetchData(); // Refresh the pending requests data
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  //ask for confirmation on accept and delete
  const handleReject = async (row: { id: any }) => {
    setShowModal(true);
    try {
      await axios.put(`http://127.0.0.1:3000/api/v1/account_requests/${row.id}`, {
        status: "Rejected",
      }); // Make a PUT request to the 'update' endpoint with status 'Rejected'
      fetchData(); // Refresh the pending requests data
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const triggerModal = async (row: { id: any }, action: "accept" | "reject") => {
    setSelectedRow(row);
    setAction(action);
    setShowModal(true);
  };
  const tableColumns = useMemo(() => REQUEST_COLUMNS(triggerModal, showCurrent), [showCurrent]);

  return (
    <Container>
      <Row>
        <Col md={{ span: 1, offset: 0 }} style={{ marginTop: "20px" }}>
          <Button onClick={() => setCurrentData(true)}>Current</Button>
        </Col>
        <Col md={{ span: 1 }} style={{ marginLeft: "-30px", marginTop: "20px" }}>
          <Button
            onClick={() => {
              setCurrentData(false);
              console.log("History button clicked");
            }}
          >
            History
          </Button>
        </Col>
        {loading ? (
          <>Loading...</>
        ) : (
          <Table data={tableData} columns={tableColumns} showGlobalFilter={showSearchBar} />
        )}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {action === "accept"
                ? "Accept Confirmation"
                : action === "reject"
                ? "Reject Confirmation"
                : "Modal Title"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {action === "accept" ? (
              <p>Are you sure you want to Accept this user?</p>
            ) : action === "reject" ? (
              <p>Are you sure you want to Reject this user?</p>
            ) : (
              "Modal Body"
            )}
          </Modal.Body>
          <Modal.Footer>
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
          </Modal.Footer>
        </Modal>
      </Row>
    </Container>
  );
};
export default PendingRequests;

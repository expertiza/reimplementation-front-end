import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Table from "components/Table/Table";
import { REQUEST_COLUMNS } from "./RequestColumns";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "hooks/useAPI";
import ModalComponent from "components/Modal";

const PendingRequests = () => {
  const [showCurrent, setCurrentData] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<{ id: any } | null>({ id: null });
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const { error, isLoading, data: dataResponse, sendRequest: fetchData } = useAPI();
  const { sendRequest } = useAPI();
  // useEffect(() => {
  //   fetchData({ url: "/account_requests/pending" });
  // }, [showCurrent]);

  useEffect(() => {
    let endpoint = showCurrent ? "pending" : "processed";
    setLoading(true);
    fetchData({ url: "/account_requests/" + endpoint });
    setLoading(false);
  }, [fetchData, showCurrent]);

  const showSearchBar = true;

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

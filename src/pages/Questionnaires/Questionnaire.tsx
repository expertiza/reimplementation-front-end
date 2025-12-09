import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import { Outlet, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { questionnaireColumns } from "./QuestionnaireColumns";
import { RiHealthBookLine } from "react-icons/ri";
import { QuestionnaireResponse } from "./QuestionnaireUtils";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import QuestionnaireTypeTable from "./QuestionnaireTypes";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";
import DeleteQuestionnaire from "./QuestionnaireDelete";




const Questionnaires = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  // loader option
  const questionnaireData :any = useLoaderData();

  useEffect(() => {
    setShowTypeModal(false);
  }, [location]);

  const [tableData, setTableData] = useState<QuestionnaireResponse[]>(questionnaireData);


  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: QuestionnaireResponse;
  }>({ visible: false });

  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<QuestionnaireResponse | null>(null);

  const { error, isLoading, data: itemsResponse, sendRequest: fetchItems } = useAPI();
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteQuestionnaireHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<QuestionnaireResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
     (row: TRow<QuestionnaireResponse>) => {
    console.log("Delete clicked:", row.original);
    setSelectedQuestionnaire(null);
    setTimeout(() => {
      setShowDeleteConfirmation({ visible: true, data: row.original });
    }, 100);
  },
  []
  );
  
  
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const tableColumns = useMemo(
    () => questionnaireColumns(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );

  const handleClose = () => setShowTypeModal(false);

  const handleRowClick = async (questionnaire: QuestionnaireResponse) => {
    setSelectedQuestionnaire(questionnaire);
    if (typeof questionnaire.id === "number") {
      await fetchItems({ url: `/questionnaires/${questionnaire.id}/items` });
    }
  };


  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage Questionnaires</h1>
            </Col>
            <hr />
          </Row>
         <Row className="mb-2">
  <Col className="d-flex justify-content-end" style={{ maxWidth: "1400px", margin: "0 auto" }}>
    <Button
      variant="success"
      onClick={() => setShowTypeModal(true)}
      className="d-flex align-items-center shadow-sm"
      style={{
        borderRadius: "8px",
        width: "48px",
        height: "48px",
      }}
    >
      <RiHealthBookLine size={24} />
    </Button>
  </Col>
</Row>

          <Row>
            {showTypeModal && (
              <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                  <Modal.Title>Select Questionnaire Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <QuestionnaireTypeTable onCloseModal={() => setShowTypeModal(false)}/>
                </Modal.Body>
              </Modal>
            )}
          </Row>
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              showColumnFilter={false}
              columnVisibility={{
                id: false,
                instructor_id: false,
              }}
              onRowClick={handleRowClick}
            />
            {selectedQuestionnaire && !showDeleteConfirmation.visible && (
   <Modal
                show={true}
                onHide={() => setSelectedQuestionnaire(null)}
                size="lg"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    Questionnaire for {selectedQuestionnaire.name}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>
                    <strong>Type:</strong>{" "}
                    {selectedQuestionnaire.questionnaire_type} &nbsp;  &nbsp;
                    
                    <strong>Private:</strong>{"     "}
                    {selectedQuestionnaire.private ? (
  <img
    src={"/assets/icons/Check-icon.png"}
    alt="Private"
    style={{ width: "14px", height: "14px", verticalAlign: "middle"}}
  />
) : (
    <span style={{ color: "red", fontWeight: "bold", verticalAlign: "middle" }}>❌</span>
  )}
                  
                  </p>
                  <p>
                    <strong>Instructor:</strong>{" "}
                    {selectedQuestionnaire.instructor?.name} (
                    {selectedQuestionnaire.instructor?.email})
                  </p>
                  

                  <h5>Items</h5>
                  {isLoading ? (
                  <p>Loading items...</p>
                ) : itemsResponse?.data?.length ?  (
                  <ol>
  {itemsResponse.data.map((item: any, i: number) => (
    <li key={i} style={{ marginBottom: "8px" }}>
      <strong>{item.txt}</strong> ({item.question_type})
      {item.alternatives && (
        <>
          &nbsp;&nbsp;<span>Choices: {item.alternatives}</span>
          <span>&nbsp;|</span>
        </>
      )}
      {item.min_label && (
        <>
          &nbsp;&nbsp;<span>Scale Min: {item.min_label}</span>
        </>
      )}
      {item.max_label && (
        <>
          &nbsp;&nbsp;<span>Max: {item.max_label}</span>
        </>
      )}
      {
        item.row_names && (
          <>
            &nbsp;&nbsp;<span>Rows: {item.row_names}</span>
          </>
        )
      }
      {
        item.col_names && (
          <>
            &nbsp;&nbsp;<span>Columns: {item.col_names}</span>
          </>
        )
      }
      {item.weight && (
        <>
          &nbsp;&nbsp;<span>Weight: {item.weight}</span>
        </>
      )}

      {
        item.question_type === "Criterion" && <span> | </span>
      }
      
      {item.textarea_width && (
        <>
          &nbsp;<span>Text Area Width: {item.textarea_width}</span>
        </>
      )}
      {item.textarea_height && (
        <>
          &nbsp;&nbsp;<span>Height: {item.textarea_height}</span>
        </>
      )}
      {item.textbox_width && (
        <>
          &nbsp;&nbsp;<span>Text Box Width: {item.textbox_width}</span>
        </>
      )}
      
    </li>
  ))}
</ol>

                ) : (
                  <p>No items defined.</p>
                )}
                </Modal.Body>
              </Modal>
)}
          </Row>
          {showDeleteConfirmation.visible && showDeleteConfirmation.data && (
  <DeleteQuestionnaire
    questionnaireData={showDeleteConfirmation.data}
    onClose={() => {
      setShowDeleteConfirmation({ visible: false });
      setSelectedQuestionnaire(null); 
    }}
     onDeleteSuccess={(deletedId: number) => {
    setTableData(prev => prev.filter(q => q.id !== deletedId));
  }}
  />
)}
        </Container>
      </main>
    </>
    
  );
};

export default Questionnaires;

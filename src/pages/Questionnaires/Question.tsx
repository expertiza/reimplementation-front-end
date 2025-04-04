import { Button, Col, Container, Row } from "react-bootstrap";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { questionnaireColumns } from "./QuestionnaireColumns";
import { BsFileText } from "react-icons/bs";
import { QuestionnaireResponse, getQuestionnaireTypes } from "./QuestionnaireUtils";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";


// FIXME: This is just a table of questionnaires and their corresponding details.
//  The reimplemenentation back end doesn't appear to have a predefined list of questionnaire types.
//  getQuestionnaireTypes in QuestionnaireUtils.tsx can be used to extract unique types from the
//  list of all questionnaires. Alternatively, a constant list of types is included in the current
//  Expertiza questionnaire model that can be used as a guide to define a constant list allowed types.


const Questionnaires = () => {
  const navigate = useNavigate();

  // loader option
  const quest :any = useLoaderData();
  console.log(quest);

  const questionnaireTypes = getQuestionnaireTypes(quest);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: QuestionnaireResponse;
  }>({ visible: false });

  const onDeleteQuestionnaireHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<QuestionnaireResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<QuestionnaireResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => questionnaireColumns(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );


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
          <Row>
            <Col md={{ span: 1, offset: 11 }}>
              <Button variant="outline-info" onClick={() => navigate("new")} className="d-flex align-items-center">
                <span className="me-1">Create</span><BsFileText />
              </Button>
            </Col>
          </Row>
          <Row>
            <Table
              data={quest}
              columns={tableColumns}
              showColumnFilter={false}
              columnVisibility={{
                id: false,
                instructor_id: false,
              }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Questionnaires;
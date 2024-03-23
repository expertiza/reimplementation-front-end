import { useCallback, useMemo, useState } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { questionnaireColumns as QUESTIONNAIRE_COLUMNS } from "./questionnaireColumns";
import axiosClient from "../../utils/axios_client";
import { BsPlusSquareFill } from "react-icons/bs";
import { IQuestionnaire } from "../../utils/interfaces";
import dummyData from './dummyData.json';
import QuestionnaireDelete from "./QuestionnaireDelete";

/**
 * @author Jeffrey Riehle on March, 2024
 */

const Questionnaires = () => {
  const navigate = useNavigate();
  const questionnaires: any = useLoaderData();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IQuestionnaire;
  }>({ visible: false });


  const tableColumns = useMemo(
    () => QUESTIONNAIRE_COLUMNS(),
    []
  );

  const tableData = dummyData //useMemo(() => questionnaires, [questionnaires]);

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
            <Table
              data={tableData}
              columns={tableColumns}
              showColumnFilter={false}
              columnVisibility={{ id: false }}
              tableSize={{ span: 6, offset: 3 }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export async function loadQuestionnaires() {
let data = {}
  data = dummyData;
  data = [{id:0, name:"test"}]
  return data;
}

export default Questionnaires;
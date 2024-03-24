import React, { useCallback, useMemo, useState } from "react";
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
  
  const [tableData, setTableData] = useState(dummyData);
  
  const onHandleNew = () => {
	var new_obj = [{
	  "id": 10,
      "name": "",
      "creationDate": "2023-02-05",
      "updatedDate": "2023-02-10"
	}]; 
	new_obj.pop();
	new_obj = getNewQuestionnaire();
	setTableData(new_obj);
  }

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IQuestionnaire;
  }>({ visible: false });


  const onEditHandle = (row: TRow<IQuestionnaire>) => {
    console.log(row.original.name);
	var index = dummyData.findIndex(item => item.name === row.original.name);
	var new_obj = [{
	  "id": 10,
      "name": "",
      "creationDate": "2023-02-05",
      "updatedDate": "2023-02-10"
	}]; 
	new_obj.pop();
	new_obj = editQuestionnaire(index);
	setTableData(new_obj);
  }
  
  
  const onDeleteHandle = (row: TRow<IQuestionnaire>) => {
    
  }
 

  const tableColumns = useMemo(
    () => QUESTIONNAIRE_COLUMNS(onEditHandle, onDeleteHandle),
    [onEditHandle, onDeleteHandle]
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
            <Col md={{ span: 1, offset: 8 }}>
              <Button variant="outline-success" onClick={() => onHandleNew()}>
                <BsPlusSquareFill />
              </Button>
            </Col>

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

const getNewQuestionnaire = () => {
  let name = (prompt("Please enter the questionnaire name:", "") as string);
  if (name == null || name == ""){
    //no name entered on prompt. 
	return dummyData;
  }
  
  var new_obj = [{
	  "id": 10,
      "name": name,
      "creationDate": "2023-02-05",
      "updatedDate": "2023-02-10"
	}]; 
	new_obj = new_obj.concat(dummyData);
	
  dummyData.push({
	  "id": 10,
      "name": name,
      "creationDate": "2023-02-05",
      "updatedDate": "2023-02-10"
	});
	
  return new_obj; 
}

const editQuestionnaire = (index: number) => {
  let name = (prompt("Please enter the questionnaire name:", "") as string);
  if (name == null || name == ""){
    //no name entered on prompt. 
	return dummyData;
  }
  
  var new_obj = [{
	  "id": 10,
      "name": name,
      "creationDate": "2023-02-05",
      "updatedDate": "2023-02-10"
	}]; 
	new_obj.pop()
	dummyData[index].name = name;
	new_obj = new_obj.concat(dummyData);
	
  return new_obj; 
}

export default Questionnaires;
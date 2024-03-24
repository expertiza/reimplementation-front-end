import React, { useCallback, useMemo, useState } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
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
  
  // useState allows us to dynamically update data without refreshing the page. 
  // tableData is the variable we want to update, setTableData is the function we will use to update it. 
  // we pass in dummyData as the default data.  
  const [tableData, setTableData] = useState(dummyData);
  
  const onHandle = () => {
	let newObject = loadNewQuestionnaire();
	setTableData(newObject);
  }

  const [displayDeleteConfirmation, setDisplayDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IQuestionnaire;
  }>({ visible: false });


  const editHandler = (row: TRow<IQuestionnaire>) => {
	var index = dummyData.findIndex(item => item.name === row.original.name);
	let newObject = editQuestionnaire(index);
	setTableData(newObject);
  }
  
  
  const deleteHandler = (row: TRow<IQuestionnaire>) => {
    var index = dummyData.findIndex(item => item.name === row.original.name);
	let newObject = discardQuestionnaire(index);
	setTableData(newObject);
  }
 

  const tableColumns = useMemo(
    () => QUESTIONNAIRE_COLUMNS(editHandler, deleteHandler),
    [editHandler, deleteHandler]
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

			  <OverlayTrigger overlay={<Tooltip>Create Questionnaire</Tooltip>}>
                <Button variant="outline-success" onClick={() => onHandleNew()}>
                  <BsPlusSquareFill />
                </Button>
		      </OverlayTrigger>
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

const loadNewQuestionnaire = () => {
  let name = (prompt("Please enter the questionnaire name:", "") as string);
  if (name == null || name == ""){
    //no name entered on prompt. 
	return dummyData;
  }
  
  // In order for the data in the table to update we need to pass back a new object.  
  var newObject = [{
	  "id": 10,
      "name": name,
      "creationDate": "2023-02-05",
      "updatedDate": "2023-02-10"
	}]; 
	newObject = newObject.concat(dummyData);
  
  // Update the data in our JSON dummy data as well so the table remains up to date if the user navigates away and back to this page.  
  dummyData.push({
	  "id": 10,
      "name": name,
      "creationDate": "2023-02-05",
      "updatedDate": "2023-02-10"
	});
	
  return newObject; 
}

const editQuestionnaire = (index: number) => {
  let name = (prompt("Please enter the questionnaire name:", "") as string);
  if (name == null || name == ""){
    //no name entered on prompt. 
	return dummyData;
  }
  
  // In order for the data in the table to update we need to pass back a new object. 
  var newObject = [{
	  "id": 10,
      "name": name,
      "creationDate": "2023-02-05",
      "updatedDate": "2023-02-10"
	}]; 
	newObject.pop()
	dummyData[index].name = name;
	newObject = newObject.concat(dummyData);
	
  return newObject; 
}

const discardQuestionnaire = (index: number) => {

  // In order for the data in the table to update we need to pass back a new object. 
  var newObject = [{
	  "id": 10,
      "name": "",
      "creationDate": "2023-02-05",
      "updatedDate": "2023-02-10"
	}]; 
	newObject.pop()
	
	dummyData.splice(index,1);
	
	newObject = newObject.concat(dummyData);
	
  return newObject; 
}

export default Questionnaires;
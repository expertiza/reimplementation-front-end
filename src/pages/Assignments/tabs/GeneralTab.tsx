import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsFileText } from "react-icons/bs";
import DeleteAssignment from "../AssignmentDelete";
import { IAssignmentResponse } from "../../../utils/interfaces";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { assignmentColumns as ASSIGNMENT_COLUMNS } from "../AssignmentColumns";

interface GeneralTabProps {
  tableData: any[];
  isLoading: boolean;
  showDeleteConfirmation: {
    visible: boolean;
    data?: IAssignmentResponse;
  };
  onDeleteAssignmentHandler: () => void;
  onEditHandle: (row: TRow<IAssignmentResponse>) => void;
  onDeleteHandle: (row: TRow<IAssignmentResponse>) => void;
}

const GeneralTab = ({
  tableData,
  isLoading,
  showDeleteConfirmation,
  onDeleteAssignmentHandler,
  onEditHandle,
  onDeleteHandle,
}: GeneralTabProps) => {
  const navigate = useNavigate();

  const tableColumns = ASSIGNMENT_COLUMNS(onEditHandle, onDeleteHandle);

  return (
    <>
      <Row>
        <Col md={{ span: 1, offset: 11 }}>
          <Button variant="outline-info" onClick={() => navigate("new")} className="d-flex align-items-center">
            <span className="me-1">Create</span><BsFileText />
          </Button>
        </Col>
        {showDeleteConfirmation.visible && (
          <DeleteAssignment assignmentData={showDeleteConfirmation.data!} onClose={onDeleteAssignmentHandler} />
        )}
      </Row>
      <Row>
        <Table
          data={tableData}
          columns={tableColumns}
          columnVisibility={{
            id: false,
          }}
        />
      </Row>
    </>
  );
};

export default GeneralTab;

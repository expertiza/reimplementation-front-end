import { useCallback, useMemo, useState } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { institutionColumns as INSTITUTION_COLUMNS } from "./institutionColumns";
import axiosClient from "../../utils/axios_client";
import InstitutionDelete from "./InstitutionDelete";
import { BsPlusSquareFill } from "react-icons/bs";
import { IInstitution } from "../../utils/interfaces";

const Institutions = () => {
  const navigate = useNavigate();
  const institutions: any = useLoaderData();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IInstitution;
  }>({ visible: false });

  const onDeleteInstitutionHandler = useCallback(
    () => setShowDeleteConfirmation({ visible: false }),
    []
  );

  const onEditHandle = useCallback(
    (row: TRow<IInstitution>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IInstitution>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => INSTITUTION_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );

  const tableData = useMemo(() => institutions, [institutions]);

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage Institutions</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col md={{ span: 1, offset: 8 }}>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="tooltip-create-new-institution">Create New Institution</Tooltip>}
              >
                <Button variant="outline-success" onClick={() => navigate("new")}>
                  <BsPlusSquareFill />
                </Button>
              </OverlayTrigger>
            </Col>
            {showDeleteConfirmation.visible && (
              <InstitutionDelete
                institutionData={showDeleteConfirmation.data!}
                onClose={onDeleteInstitutionHandler}
              />
            )}
          </Row>
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              showColumnFilter={false}
              columnVisibility={{ id: false }}
              tableSize={{ span: 12, offset: 0 }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export async function loadInstitutions() {
  const institutionsResponse = await axiosClient.get("/institutions");
  return await institutionsResponse.data;
}

export default Institutions;

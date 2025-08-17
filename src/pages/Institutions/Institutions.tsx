import { useCallback, useMemo, useState } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { institutionColumns as INSTITUTION_COLUMNS } from "./institutionColumns";
import axiosClient from "../../utils/axios_client";
import InstitutionDelete from "./InstitutionDelete";
import { BsPlusSquareFill } from "react-icons/bs";
import { IInstitution, ROLE } from "../../utils/interfaces";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { hasAllPrivilegesOf } from "utils/util";

const Institutions = () => {
  const navigate = useNavigate();
  const institutions: any = useLoaderData();

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  
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
          {/*Added authetication for manage institution to be accessed by roles higher than instructor */}
          {hasAllPrivilegesOf(auth.user.role, ROLE.INSTRUCTOR) &&(
            <>
              <Row>
              <Col md={{ span: 10, offset: 8 }}>
                <Button variant="outline-success" onClick={() => navigate("new")}>
                  <BsPlusSquareFill />
                </Button>
              </Col>
              {showDeleteConfirmation.visible && (
                <InstitutionDelete
                  institutionData={showDeleteConfirmation.data!}
                  onClose={onDeleteInstitutionHandler}
                />
              )}
            </Row>
            <Row className="justify-content-center">
              <Col md ={5}>
              <Table
                data={tableData}
                columns={tableColumns}
                showColumnFilter={false}
                columnVisibility={{ id: false }}
                
              />
              </Col>
            </Row>
            </>
          ) }

          {!hasAllPrivilegesOf(auth.user.role, ROLE.INSTRUCTOR) 
          && (
            <h1>Institution changes not allowed</h1>
          )}
          
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

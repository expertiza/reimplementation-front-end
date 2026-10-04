import { useCallback, useMemo, useState } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Row as TRow } from "@tanstack/react-table";
import Table from "../../components/Table/Table";
import axiosClient from "../../utils/axios_client";
import { BsPlusSquareFill } from "react-icons/bs";
import { IRole } from "../../utils/interfaces";
import { roleColumns as ROLE_COLUMNS } from "./roleColumns";
import DeleteRole from "./RoleDelete";

/**
 * @author Ankur Mundra on June, 2023
 */

const Roles = () => {
  const navigate = useNavigate();
  const roles: any = useLoaderData();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IRole;
  }>({ visible: false });

  const onDeleteRoleHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<IRole>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IRole>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => ROLE_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );
  const tableData = useMemo(() => roles, [roles]);

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage Roles</h1>
            </Col>
            <hr />
          </Row>
          <Row className="mb-1">
            <Col md={{ span: 1, offset: 8 }}>
              <Button variant="outline-success" onClick={() => navigate("new")}>
                <BsPlusSquareFill />
              </Button>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteRole roleData={showDeleteConfirmation.data!} onClose={onDeleteRoleHandler} />
            )}
          </Row>
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              tableSize={{ span: 6, offset: 3 }}
              showColumnFilter={false}
              showPagination={false}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export async function loadRoles() {
  const rolesResponse = await axiosClient.get("/roles");
  return await rolesResponse.data;
}

export default Roles;

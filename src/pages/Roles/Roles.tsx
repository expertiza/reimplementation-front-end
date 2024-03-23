// IMPORTS
import { useCallback, useMemo, useState } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import axiosClient from "../../utils/axios_client";
import { BsPlusSquareFill } from "react-icons/bs";
import { IRole } from "../../utils/interfaces";
import { roleColumns as ROLE_COLUMNS } from "./roleColumns";
import DeleteRole from "./RoleDelete";
import { access } from './Access';

/**
 * @author Ankur Mundra on June, 2023
 */

// INTERFACE => LOCALSTORAGE LOGIN DATA
interface RoleLogin {
  isAuthenticated: string;
  authToken: string;
  user: any;
}

// DEFAULT EXPORT FUNCTION
const Roles = () => {
  // ACCESSING LOCALSTORAGE LOGIN DATA
  const roleLoginString: string | null = localStorage.getItem("persist:authentication");
  const roleLogin: RoleLogin | null = roleLoginString ? JSON.parse(roleLoginString) : null;

  // HOOKS
  const navigate = useNavigate();
  const roles: any = useLoaderData();

  // USESTATE DATA OBJECTS
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IRole;
  }>({ visible: false });

  // CALLBACKS
  const onDeleteRoleHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<IRole>) => {
      if(access[JSON.parse(roleLogin?.user).role].indexOf(row.original.name) != -1){
        navigate(`edit/${row.original.id}`)
      } else {
        window.alert("You do not have access to edit this role.");
      }
    },
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IRole>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  // DATA POPULATE
  const tableColumns = useMemo(
    () => ROLE_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );
  const tableData = useMemo(() => roles, [roles]);

  // DOM RENDERING
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
          {/* NEW ROLE */}
          <Row className="mb-1">
            <Col md={{ span: 1, offset: 8 }}>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="tooltip-create-new-role">Create New Role</Tooltip>}
              >
                <Button variant="outline-success" onClick={() => navigate("new")}>
                  <BsPlusSquareFill />
                </Button>
              </OverlayTrigger>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteRole roleData={showDeleteConfirmation.data!} onClose={onDeleteRoleHandler} />
            )}
          </Row>
          {/* TABLE DATA */}
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              tableSize={{ span: 12, offset: 0 }}
              showColumnFilter={false}
              showPagination={false}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

// API => LOAD DATA ROLES
export async function loadRoles() {
  const rolesResponse = await axiosClient.get("/roles");
  return await rolesResponse.data;
}

// EXPORT FUNCTION
export default Roles;


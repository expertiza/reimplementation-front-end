/**
 * @author Ankur Mundra on June, 2023
 */
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import React, { useCallback, useMemo, useState } from "react";
import { IUserResponse } from "../../utils/interfaces";
import { Row as TRow } from "@tanstack/react-table";
import { userColumns as USER_COLUMNS } from "../Users/userColumns";
import { Col, Container, Row } from "react-bootstrap";
import DeleteUser from "../Users/UserDelete";
import Table from "../../components/Table/Table";
import axiosClient from "../../utils/axios_client";

const ManageUserTypes: React.FC = () => {
  const navigate = useNavigate();
  const { user_type } = useParams();
  const data: any = useLoaderData();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IUserResponse;
  }>({ visible: false });

  const onDeleteUserHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<IUserResponse>) => navigate(`/users/edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IUserResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => USER_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );

  return (
    <Container fluid className="px-md-4">
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>Manage {user_type!.valueOf()}</h1>
        </Col>
        <hr />
      </Row>
      <Row>
        {showDeleteConfirmation.visible && (
          <DeleteUser userData={showDeleteConfirmation.data!} onClose={onDeleteUserHandler} />
        )}
      </Row>
      <Row>
        <Table
          data={data}
          columns={tableColumns}
          columnVisibility={{
            id: false,
            role: false,
            parent: false,
            email_preferences: false,
            email_on_review: false,
            email_on_submission: false,
            email_on_review_of_review: false,
          }}
        />
      </Row>
    </Container>
  );
};

// add loader function to load role specific users

export async function loader({ request }: { request: Request }) {
  let role_name = request.url.split("/").pop()!;
  let role = ["administrators", "instructors", "super_administrators"].find(
    (role) => role === role_name
  );
  if (role) {
    role = role.substring(0, role.length - 1);
    const response = await axiosClient.get(`/users/role/${role}`);
    return response.data;
  }
  throw new Error("404 not found! No such route exists");
}

export default ManageUserTypes;

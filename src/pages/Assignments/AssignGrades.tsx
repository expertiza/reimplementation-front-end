import axiosClient from "../../utils/axios_client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Container, Row, Col } from 'react-bootstrap';
import Table from "components/Table/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Outlet, useLoaderData, useNavigate, useParams, useLocation} from "react-router-dom";
import { Row as TRow } from "@tanstack/table-core/build/lib/types";
import { IUserResponse } from "../../utils/interfaces";
import ErrorPage from "../../router/ErrorPage";


interface ISubmission {
  id: number;
  name: string;
  participants: IUserResponse[];
  topic: string;
  team_id: number;
}

const columnHelper = createColumnHelper<ISubmission>();

const AssignGrades: React.FC = () => {

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const assignment: any = useLoaderData();
  const [error, setError] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);




  const toggleSubmission = () => {
    setShowSubmission(!showSubmission);
  };


  if (error) { return <ErrorPage /> }
  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Summary Report for assignment</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col>


            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default AssignGrades;
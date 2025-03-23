import axiosClient from "../../utils/axios_client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Container, Row, Col } from 'react-bootstrap';
import Table from "components/Table/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Row as TRow } from "@tanstack/table-core/build/lib/types";
import { IUserResponse } from "../../utils/interfaces";
import ErrorPage from "../../router/ErrorPage";
import AlertMessage from "components/Alert";


interface ISubmission {
  id: number;
  name: string;
  participants: IUserResponse[];
  topic: string;
  team_id: number;
}

interface IAlertProps {
  variant: string;
  title?: string;
  message: string;
}


const columnHelper = createColumnHelper<ISubmission>();

const ViewSubmissions: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const assignment: any = useLoaderData();
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState<IAlertProps | null>(null);
  const [submissions, setSubmissions] = useState([]);
  let columns: ColumnDef<ISubmission, any>[] = [];


  // determine if the assignment has topics
  if (assignment.has_topics) {
    columns.push(
      columnHelper.accessor("topic", {
        header: () => "Topic",
        cell: (info) => info.getValue(),
        size: 100,
        minSize: 80,
        maxSize: 200,
      })
    )
  }

  // determine if the assignment has teams
  if (assignment.has_teams) {

    // name column will be the Team's name
    columns.push( columnHelper.accessor("name", {
      header: () => "Team",
      cell: (info) => info.getValue(),
    }));
    columns.push(columnHelper.accessor("participants", {
      header: () => "Team Members",
      cell: (info) => (
        <>
          {info.getValue().map((participant :IUserResponse, index :number) => (
            <div key={index}>{participant.full_name + " (" + participant.name + ")"}</div>
          ))}
        </>
      ),
    }));
  }
  else {
    columns.push(columnHelper.accessor("participants", {
      header: () => "Student",
      cell: (info) => (
        <>
          {info.getValue().map((participant :IUserResponse, index :number) => (
            <div key={index}>{participant.full_name + " (" + participant.name + ")"}</div>
          ))}
        </>
      ),
    }));
  }


  // fetch submissions data
  useEffect(() => {
    try {
      async function fetchSubmissions() {
        try {
          const submissionsResponse = await axiosClient.get(`/assignments/${assignment.id}/list_submissions`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });
          setSubmissions(submissionsResponse.data);
        }
        catch (e) {
          console.error(e);
          setAlert({
            variant: "danger",
            title: "Error",
            message: "Unable to fetch submissions for this assignment.",
          });
        }
      }
      fetchSubmissions();
    }
    catch (e) {
      setError(true);
    }
  }, [assignment, token]);


  // links column
  columns.push(columnHelper.display({
      id: "links",
      header: () => "Links",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "10px" }}>
        </div>
      ),
    }));

  // actions column
  columns.push(columnHelper.display({
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => (
      <div style={{ display: "flex", gap: "10px" }}>
        <Button
          variant="outline-info"
          size="sm"
          onClick={() => handleHistoryClick(row)}
        >
          History
        </Button>
        <Button
          variant="outline-warning"
          size="sm"
          onClick={() => handleAssignGradesClick(row)}
        >
          Assign Grade
        </Button>
      </div>
    ),
  }));



  // navigation to submission history
  // the models, controllers, and routes for the submission history for a given team have not yet
  // been implemented in the reimplementation back end. In the current expertize, the history links
  // to /submission_records?team_id=33868
  const handleHistoryClick = useCallback(
    (row: TRow<ISubmission>) => navigate(`/assignments/edit/${row.original.id}`),
    [navigate]
  );

  // navigation to assign grades page
  // the models, controllers, and associated routes for grades have not yet been implemented in the
  // reimplementation back end. In the current version of expertiza, the assign grades page links to
  // /grades/view_team?id=45297
  const handleAssignGradesClick = useCallback(
    (row: TRow<ISubmission>) => navigate(`/grades/view_team/${row.original.id}`),
    [navigate]
  );


  if (error) { return <ErrorPage /> }
  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>{assignment.name} Submissions</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col>
              {alert && <AlertMessage {...alert} />}
              <Table
                data={submissions}
                columns={columns}
                showColumnFilter={false}
                showGlobalFilter={false}
                showPagination={submissions.length >= 10}
              />
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default ViewSubmissions;
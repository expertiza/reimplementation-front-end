import { useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Alert, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import { alertActions } from "store/slices/alertSlice";
import { IAssignmentResponse } from "utils/interfaces";

export interface ISubmissionMember {
  fullName: string;
  github: string;
  email: string;
}

export interface ISubmissionLink {
  id: number;
  url?: string;
  displayName: string;
  name: string;
  size?: number | string;
  type?: string;
  modified?: string;
}

export interface ISubmission {
  id: number;
  teamId: number;
  teamName: string;
  members: ISubmissionMember[];
  links: ISubmissionLink[];
  files: ISubmissionLink[];
}

interface ISubmissionMemberResponse {
  full_name?: string;
  github?: string;
  email?: string;
}

interface ISubmissionAssetResponse {
  id?: number;
  url?: string;
  display_name?: string;
  name?: string;
  size?: number | string;
  type?: string;
  modified?: string;
}

interface ISubmissionResponse {
  id?: number;
  submission_id?: number;
  team_id?: number;
  team_name?: string;
  members?: ISubmissionMemberResponse[];
  links?: ISubmissionAssetResponse[];
  files?: ISubmissionAssetResponse[];
}

interface IViewSubmissionsResponse {
  assignment_id?: number;
  assignment_name?: string;
  submissions?: ISubmissionResponse[];
}

type ViewSubmissionsLoaderData = Partial<IAssignmentResponse> & {
  due_dates?: Array<{ due_at?: string | Date }>;
  date_time?: Record<string, string | Date>;
};

const columnHelper = createColumnHelper<ISubmission>();
const EMPTY_MESSAGE = "No submissions are available for this assignment yet.";

const buildGithubUrl = (github?: string) => {
  if (!github) return "";
  if (/^https?:\/\//i.test(github)) return github;
  return `https://github.com/${github.replace(/^@/, "")}`;
};

const getGithubLabel = (github?: string, email?: string) => {
  if (!github) return email || "Unknown member";

  const cleanedGithub = github.replace(/^@/, "");
  if (/^https?:\/\//i.test(cleanedGithub)) {
    try {
      const url = new URL(cleanedGithub);
      return url.pathname.split("/").filter(Boolean).pop() || cleanedGithub;
    } catch {
      return cleanedGithub;
    }
  }

  return cleanedGithub;
};

const formatModifiedValue = (value?: string) => {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString();
};

const transformAsset = (
  asset: ISubmissionAssetResponse,
  index: number
): ISubmissionLink => ({
  id: asset.id ?? index + 1,
  url: asset.url,
  displayName: asset.display_name ?? asset.name ?? asset.url ?? `Artifact ${index + 1}`,
  name: asset.name ?? asset.display_name ?? asset.url ?? `Artifact ${index + 1}`,
  size: asset.size ?? "-",
  type: asset.type ?? (asset.url ? "Link" : "File"),
  modified: asset.modified ?? "",
});

export const transformResponse = (
  response?: IViewSubmissionsResponse | null
): ISubmission[] | null => {
  if (!response || !Array.isArray(response.submissions)) {
    return null;
  }

  return response.submissions.map((submission, index) => {
    const submissionId = submission.id ?? submission.submission_id ?? index + 1;
    const teamId = submission.team_id ?? submission.id ?? index + 1;

    return {
      id: submissionId,
      teamId,
      teamName: submission.team_name ?? `Team ${index + 1}`,
      members: Array.isArray(submission.members)
        ? submission.members.map((member) => ({
            fullName: member.full_name ?? "",
            github: member.github ?? "",
            email: member.email ?? "",
          }))
        : [],
      links: Array.isArray(submission.links)
        ? submission.links.map((link, linkIndex) => transformAsset(link, linkIndex))
        : [],
      files: Array.isArray(submission.files)
        ? submission.files.map((file, fileIndex) => transformAsset(file, fileIndex))
        : [],
    };
  });
};

const buildFallbackSubmissions = (assignmentId: number): ISubmission[] => [
  {
    id: assignmentId * 100 + 1,
    teamId: assignmentId * 10 + 1,
    teamName: "Mock Team 01",
    members: [
      {
        fullName: "Alice Johnson",
        github: "alice-johnson",
        email: "alice@example.com",
      },
      {
        fullName: "Bob Carter",
        github: "https://github.com/bobcarter",
        email: "bob@example.com",
      },
    ],
    links: [
      {
        id: 1,
        displayName: "Project repository",
        name: "Project repository",
        url: "https://github.com/mock-team-01/project",
        size: "-",
        type: "Hyperlink",
        modified: "2026-03-15T18:30:00Z",
      },
    ],
    files: [
      {
        id: 2,
        displayName: "design-spec.pdf",
        name: "design-spec.pdf",
        url: "https://example.com/mock/design-spec.pdf",
        size: "128 KB",
        type: "PDF",
        modified: "2026-03-15T18:40:00Z",
      },
    ],
  },
  {
    id: assignmentId * 100 + 2,
    teamId: assignmentId * 10 + 2,
    teamName: "Mock Team 02",
    members: [
      {
        fullName: "Chris Lee",
        github: "chrislee",
        email: "chris@example.com",
      },
    ],
    links: [
      {
        id: 3,
        displayName: "Demo video",
        name: "Demo video",
        url: "https://example.com/mock/demo-video",
        size: "-",
        type: "Hyperlink",
        modified: "2026-03-16T13:05:00Z",
      },
    ],
    files: [
      {
        id: 4,
        displayName: "slides.pptx",
        name: "slides.pptx",
        url: "https://example.com/mock/slides.pptx",
        size: "2.3 MB",
        type: "PowerPoint",
        modified: "2026-03-16T13:10:00Z",
      },
    ],
  },
];

const getLatestDueDate = (assignment: ViewSubmissionsLoaderData) => {
  const dueDateValues = Array.isArray(assignment?.due_dates)
    ? assignment.due_dates
        .map((dueDate) => dueDate?.due_at)
        .filter((value): value is string | Date => Boolean(value))
    : [];

  if (dueDateValues.length > 0) {
    const parsedDates = dueDateValues
      .map((dueDate) => new Date(dueDate))
      .filter((dueDate) => !Number.isNaN(dueDate.getTime()));

    if (parsedDates.length > 0) {
      return parsedDates.reduce((latest, current) =>
        current.getTime() > latest.getTime() ? current : latest
      );
    }
  }

  const dateTimeEntries = assignment?.date_time ? Object.values(assignment.date_time) : [];
  const parsedDateTimeEntries = dateTimeEntries
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()));

  if (parsedDateTimeEntries.length === 0) {
    return null;
  }

  return parsedDateTimeEntries.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest
  );
};

const ViewSubmissions = () => {
  const assignment = (useLoaderData?.() as ViewSubmissionsLoaderData) || {};
  const { id: routeAssignmentId } = useParams<{ id: string }>();
  const assignmentId = Number(assignment?.id ?? routeAssignmentId ?? 0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, isLoading, data: submissionsResponse, sendRequest: fetchSubmissions } = useAPI();

  const [submissions, setSubmissions] = useState<ISubmission[]>([]);

  const fallbackSubmissions = useMemo(
    () => buildFallbackSubmissions(assignmentId || 1),
    [assignmentId]
  );

  const shouldShowAssignGrade = useMemo(() => {
    const latestDueDate = getLatestDueDate(assignment);
    return latestDueDate ? latestDueDate.getTime() < Date.now() : false;
  }, [assignment]);

  useEffect(() => {
    if (!assignmentId) return;

    fetchSubmissions({
      url: `/assignments/${assignmentId}/view_submissions`,
    });
  }, [assignmentId, fetchSubmissions]);

  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (submissionsResponse?.data) {
      const transformedSubmissions = transformResponse(
        submissionsResponse.data as IViewSubmissionsResponse
      );
      setSubmissions(transformedSubmissions ?? fallbackSubmissions);
      return;
    }

    if (!isLoading && (error || !submissionsResponse)) {
      setSubmissions(fallbackSubmissions);
    }
  }, [error, fallbackSubmissions, isLoading, submissionsResponse]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("teamName", {
        header: () => "Team Name",
        cell: ({ row, getValue }) => (
          <div className="d-flex flex-column gap-2">
            <span className="fw-semibold">{getValue()}</span>
            <Button
              size="sm"
              variant={shouldShowAssignGrade ? "success" : "outline-primary"}
              onClick={(event) => {
                event.stopPropagation();
                navigate(
                  shouldShowAssignGrade
                    ? `/assignments/${assignmentId}/assign-grades?team_id=${row.original.teamId}`
                    : `/assignments/${assignmentId}/review?team_id=${row.original.teamId}`
                );
              }}
            >
              {shouldShowAssignGrade ? "Assign grade" : "View Reviews"}
            </Button>
          </div>
        ),
      }),
      columnHelper.accessor("members", {
        header: () => "Team Members",
        cell: ({ getValue }) => {
          const members = getValue();

          if (members.length === 0) {
            return <span className="text-muted">No team members</span>;
          }

          return (
            <ul className="list-unstyled mb-0">
              {members.map((member) => {
                const githubUrl = buildGithubUrl(member.github);
                const githubLabel = getGithubLabel(member.github, member.email);

                return (
                  <li key={`${member.email}-${member.github}`}>
                    {githubUrl ? (
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                        {githubLabel}
                      </a>
                    ) : (
                      <span>{githubLabel}</span>
                    )}{" "}
                    {member.fullName && <span className="text-muted">({member.fullName})</span>}
                  </li>
                );
              })}
            </ul>
          );
        },
      }),
      columnHelper.display({
        id: "links",
        header: () => "Links",
        cell: ({ row }) => {
          const artifacts = [...row.original.links, ...row.original.files];

          if (artifacts.length === 0) {
            return <span className="text-muted">No submission artifacts</span>;
          }

          return (
            <table className="table table-sm table-borderless mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Date Modified</th>
                </tr>
              </thead>
              <tbody>
                {artifacts.map((artifact) => (
                  <tr key={`${row.original.id}-${artifact.id}-${artifact.name}`}>
                    <td>
                      {artifact.url ? (
                        <a href={artifact.url} target="_blank" rel="noopener noreferrer">
                          {artifact.displayName}
                        </a>
                      ) : (
                        artifact.displayName
                      )}
                    </td>
                    <td>{artifact.size ?? "-"}</td>
                    <td>{artifact.type ?? "-"}</td>
                    <td>{formatModifiedValue(artifact.modified)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        },
      }),
      columnHelper.display({
        id: "history",
        header: () => "History",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/submissions/history/${row.original.id}`);
            }}
          >
            View history
          </Button>
        ),
      }),
    ],
    [assignmentId, navigate, shouldShowAssignGrade]
  );

  const showLoadingState = isLoading && submissions.length === 0 && !submissionsResponse?.data;
  const showEmptyState = !showLoadingState && submissions.length === 0;

  return (
    <main>
      <Container fluid className="px-md-4">
        <Row className="mt-md-2 mb-md-2">
          <Col className="text-center">
            <h1>View Submissions</h1>
            {assignment?.name && <p className="text-muted mb-0">{assignment.name}</p>}
          </Col>
          <hr />
        </Row>

        {showLoadingState ? (
          <Row className="justify-content-center py-5">
            <Col md="auto" className="d-flex align-items-center gap-3">
              <Spinner animation="border" role="status" />
              <span>Loading submissions...</span>
            </Col>
          </Row>
        ) : showEmptyState ? (
          <Row className="justify-content-center py-4">
            <Col md={8}>
              <Alert variant="info" className="mb-0 text-center">
                {EMPTY_MESSAGE}
              </Alert>
            </Col>
          </Row>
        ) : (
          <Row>
            <Table
              showGlobalFilter={false}
              data={submissions}
              columns={columns}
              showColumnFilter={false}
            />
          </Row>
        )}
      </Container>
    </main>
  );
};

export default ViewSubmissions;

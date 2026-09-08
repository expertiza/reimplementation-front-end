import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { Container, Spinner } from "react-bootstrap";
import { createColumnHelper } from "@tanstack/react-table";
import { BsCaretDownFill, BsCaretUpFill } from "react-icons/bs";
import Table from "../../components/Table/Table";
import { revieweesToRoundRows } from "./reportLayout";
import { openReviewDetail } from "../../utils/openReviewDetail";
import axiosClient from "../../utils/axios_client";
import "./Reviews.css";

// --------------------------------------------------------------------------
// --- SORTABLE HEADER ---
// --------------------------------------------------------------------------

function SortableHeadefr({
  label,
  column,
  isSortable = true,
}: {
  label: string;
  column: { getIsSorted: () => false | "asc" | "desc" };
  isSortable?: boolean;
}) {
  return (
    <span className="review-report-th">
      {label}
      {isSortable && (
        <span className="ms-1 review-report-sort-icon" style={{ verticalAlign: "middle" }}>
          {column.getIsSorted() === "asc" && <BsCaretUpFill />}
          {column.getIsSorted() === "desc" && <BsCaretDownFill />}
          {!column.getIsSorted() && (
            <span className="review-report-sort-unsorted">
              <BsCaretUpFill style={{ opacity: 0.6 }} />
              <BsCaretDownFill style={{ opacity: 0.6 }} />
            </span>
          )}
        </span>
      )}
    </span>
  );
}

// --------------------------------------------------------------------------
// --- INTERFACES ---
// --------------------------------------------------------------------------

interface RevieweeEntry {
  revieweeName: string;
  submitted: boolean;
  lastReviewedAt: string | null;
  scores: import("./reportLayout").ScoreEntry[];
  additionalComment: string | null;
}

interface ReviewRow {
  reviewerId: number;
  reviewerName: string;
  teamName: string;
  reviewsDone: number;
  reviewsTotal: number;
  reviewees: RevieweeEntry[];
}

interface ApiReview {
  id: number;
  team_name: string | null;
  reviewer: { id: number; user: { id: number; name: string } };
  reviewee: { id: number; user: { id: number; name: string } };
  submitted: boolean;
  last_reviewed_at: string | null;
  responses: {
    id: number;
    is_submitted: boolean;
    additional_comment: string | null;
    scores: import("./reportLayout").ScoreEntry[];
  }[];
}

interface FetchReportResponse {
  type: string;
  assignment_id: number;
  assignment_name?: string;
  reviews: ApiReview[];
}

// --------------------------------------------------------------------------
// --- TRANSFORM ---
// --------------------------------------------------------------------------

function transformResponse(data: FetchReportResponse): ReviewRow[] {
  const reviewerMap = new Map<number, ReviewRow>();

  data.reviews.forEach((r) => {
    const rid = r.reviewer.id;
    if (!reviewerMap.has(rid)) {
      reviewerMap.set(rid, {
        reviewerId:   rid,
        reviewerName: r.reviewer.user.name,
        teamName:     r.team_name ?? "—",
        reviewsDone:  0,
        reviewsTotal: 0,
        reviewees:    [],
      });
    }
    const row = reviewerMap.get(rid)!;
    const submittedResp = r.responses?.find((resp) => resp.is_submitted) ?? null;

    row.reviewsTotal += 1;
    if (r.submitted) row.reviewsDone += 1;
    row.reviewees.push({
      revieweeName:      r.reviewee.user.name,
      submitted:         r.submitted,
      lastReviewedAt:    r.last_reviewed_at,
      scores:            submittedResp?.scores ?? [],
      additionalComment: submittedResp?.additional_comment ?? null,
    });
  });

  // Sort by team name, then reviewer name
  return Array.from(reviewerMap.values()).sort((a, b) =>
    a.teamName.localeCompare(b.teamName) || a.reviewerName.localeCompare(b.reviewerName)
  );
}


// --------------------------------------------------------------------------
// --- COLUMNS ---
// --------------------------------------------------------------------------

const columnHelper = createColumnHelper<ReviewRow>();

function buildColumns(_onView: (row: ReviewRow) => void, rows: ReviewRow[]) {
  return [
    columnHelper.accessor("teamName", {
      header: ({ column }) => <SortableHeader label="Team" column={column} />,
      cell: ({ row, table }) => {
        // Show team name only on the first row of each team group
        const allRows = table.getRowModel().rows;
        const idx = allRows.findIndex((r) => r.id === row.id);
        const isFirstInGroup = idx === 0 || allRows[idx - 1].original.teamName !== row.original.teamName;
        return isFirstInGroup ? <strong>{row.original.teamName}</strong> : null;
      },
    }),
    columnHelper.accessor("reviewerName", {
      header: ({ column }) => <SortableHeader label="Reviewer" column={column} />,
      cell: ({ row }) => (
        <Link to={`/users/${row.original.reviewerId}`}>
          {row.original.reviewerName}
        </Link>
      ),
    }),
    columnHelper.display({
      id: "reviewsDone",
      header: () => <span className="review-report-th"># Teammate Reviews Done</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const { reviewsDone, reviewsTotal } = row.original;
        return reviewsTotal <= 1 ? "—" : `${reviewsDone}/${reviewsTotal}`;
      },
    }),
    columnHelper.display({
      id: "reviewees",
      header: () => <span className="review-report-th">Teammates Reviewed</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          {row.original.reviewees.map((r, i) => (
            <div key={i} style={{ color: r.submitted ? "green" : "#dc3545" }}>
              {r.revieweeName}
            </div>
          ))}
        </div>
      ),
    }),
    columnHelper.display({
      id: "lastReviewedAt",
      header: ({ column }) => <SortableHeader label="Last Reviewed At" column={column} isSortable={false} />,
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          {row.original.reviewees.map((r, i) => (
            <div key={i} style={{ color: r.submitted ? "green" : "#dc3545" }}>
              {r.submitted && r.lastReviewedAt
                ? new Date(r.lastReviewedAt).toLocaleString("en-US", {
                    month: "2-digit", day: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })
                : r.submitted ? "—" : "—"}
            </div>
          ))}
        </div>
      ),
    }),
    columnHelper.display({
      id: "view",
      header: () => <span className="review-report-th">Reviews</span>,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.reviewsDone > 0 ? (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openReviewDetail(
                `Reviews by ${row.original.reviewerName}`,
                revieweesToRoundRows(row.original.reviewees)
              );
            }}
          >
            view
          </a>
        ) : null,
    }),
  ];
}

// --------------------------------------------------------------------------
// --- MAIN COMPONENT ---
// --------------------------------------------------------------------------

const TeammateReviewReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [assignmentName, setAssignmentName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const stickyElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let rafId: number | null = null;
    const update = () => {
      const wrapper = tableWrapperRef.current;
      const thead = wrapper?.querySelector("thead");
      const table = wrapper?.querySelector("table");
      if (!thead || !table) return;
      const navbarHeight = (document.querySelector(".navbar") as HTMLElement)?.offsetHeight ?? 0;
      const rect = thead.getBoundingClientRect();
      const wrapperRect = wrapper!.getBoundingClientRect();
      const shouldShow = rect.bottom < navbarHeight && wrapperRect.bottom > navbarHeight;
      if (!stickyElRef.current) {
        const cloneTable = document.createElement("table");
        cloneTable.className = "table table-sm";
        cloneTable.style.cssText = `margin:0;table-layout:fixed;border-collapse:collapse;width:100%;`;
        const cloneThead = document.createElement("thead");
        const cloneTr = document.createElement("tr");
        Array.from(thead.querySelectorAll("th")).forEach((th) => {
          const cloneTh = document.createElement("th");
          const label = th.querySelector(".review-report-th")?.childNodes[0]?.textContent ?? th.textContent ?? "";
          cloneTh.textContent = label;
          cloneTr.appendChild(cloneTh);
        });
        cloneThead.appendChild(cloneTr);
        cloneTable.appendChild(cloneThead);
        const fixed = document.createElement("div");
        fixed.style.cssText = `position:fixed;display:none;z-index:1021;overflow:hidden;background:#e2e3e5;box-shadow:0 2px 4px rgba(0,0,0,0.15);`;
        fixed.appendChild(cloneTable);
        document.body.appendChild(fixed);
        stickyElRef.current = fixed;
      }
      const el = stickyElRef.current;
      if (shouldShow) {
        const tableRect = table.getBoundingClientRect();
        const realThs = Array.from(thead.querySelectorAll("th"));
        const cloneThs = Array.from(el.querySelectorAll("th"));
        realThs.forEach((th, i) => {
          const cloneTh = cloneThs[i] as HTMLElement;
          if (!cloneTh) return;
          const w = th.getBoundingClientRect().width;
          const p = getComputedStyle(th).padding;
          cloneTh.style.cssText = `background:#e2e3e5;border:none;font-weight:600;width:${w}px;min-width:${w}px;box-sizing:border-box;padding:${p};`;
        });
        el.style.display = "block";
        el.style.top = navbarHeight + "px";
        el.style.left = tableRect.left + "px";
        el.style.width = tableRect.width + "px";
      } else {
        el.style.display = "none";
      }
    };
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      if (rafId) cancelAnimationFrame(rafId);
      stickyElRef.current?.remove();
      stickyElRef.current = null;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.post<FetchReportResponse>("/reports/generate_report", {
          assignment_id: id,
          type: "teammate_review_response_map",
        });
        setRows(transformResponse(response.data));
        setAssignmentName(response.data.assignment_name ?? null);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Failed to fetch data");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const columns = useMemo(() => buildColumns(() => {}, rows), [rows]);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <h2 className="text-danger">Error loading report</h2>
        <p>{error}</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-3 review-report-page teammate-review-report-page">
      <div className="review-report-selector" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn-back-assignment" onClick={() => navigate(`/assignments/edit/${id}`)}>Back</button>
        <select
          name="reports"
          id="report-select"
          defaultValue="teammate"
          onChange={(e) => {
            if (e.target.value === "review") navigate(`/assignments/${id}/review`);
          }}
        >
          <option value="review">Review report</option>
          <option value="teammate">Teammate Review report</option>
        </select>
      </div>

      <h2 style={{ textAlign: "left", fontSize: "1.3rem", color: "#333", margin: "8px 0 6px" }}>Teammate Review Report{assignmentName ? ` — ${assignmentName}` : ""}</h2>

      <div className="review-report-table-wrapper mt-1" ref={tableWrapperRef}>
        {rows.length === 0
          ? <p>No teammate reviews found for this assignment.</p>
          : (
            <Table
              data={rows}
              columns={columns}
              showGlobalFilter={true}
              showColumnFilter={false}
              showPagination={rows.length >= 10}
              tableStyle={{ width: "fit-content", margin: 0 }}
              getCellProps={(cell, row) => {
                const { reviewsDone, reviewsTotal } = row.original;
                const allDone = reviewsTotal > 0 && reviewsDone === reviewsTotal;
                if (allDone && (cell.column.id === "reviewees" || cell.column.id === "lastReviewedAt")) {
                  return { style: { backgroundColor: "#d4edda" } };
                }
                return {};
              }}
            />
          )
        }
      </div>
    </Container>
  );
};

export default TeammateReviewReportPage;

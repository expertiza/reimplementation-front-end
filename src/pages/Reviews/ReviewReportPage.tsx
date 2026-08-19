import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Spinner,
  Button,
  Form,
  InputGroup,
  Alert,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { createColumnHelper } from "@tanstack/react-table";
import { BsCaretDownFill, BsCaretUpFill } from "react-icons/bs";
import Table from "../../components/Table/Table";
import ToolTip from "../../components/ToolTip";
import { summaryResponsesToRoundRows, SummaryResponse as SharedSummaryResponse } from "./reportLayout";
import { openReviewDetail } from "../../utils/openReviewDetail";
import axiosClient from "../../utils/axios_client";
import "./Reviews.css";

// --------------------------------------------------------------------------
// --- SORTABLE HEADER ---
// --------------------------------------------------------------------------

function SortableHeader({
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

const columnHelper = createColumnHelper<ReviewData>();

// --------------------------------------------------------------------------
// --- INTERFACES ---
// --------------------------------------------------------------------------

interface AvgRange {
  min: number | null;
  max: number | null;
  avg: number | null;
}

interface ReviewRound {
  round: number;
  calculatedScore: number | null;
  maxScore: number | null;
  reviewVolume: number;
  reviewCommentCount: number;
  teamAvgRange: AvgRange | null;
}

type SummaryResponse = SharedSummaryResponse;

interface ReviewData {
  id: number;
  reviewerName: string;
  reviewerId: number;
  reviewsCompleted: number;
  reviewsSelected: number;
  reviewsPerRound: { round: number; completed: number; total: number }[];
  teamReviewedName: string;
  teamReviewedStatus: "red" | "blue" | "green" | "purple" | "brown";
  hasConsent: boolean;
  calculatedScore: number | null;
  rounds: ReviewRound[];
  reviewVolume: number;
  reviewCommentCount: number;
  assignedGrade: number | null;
  instructorComment: string | null;
  summaryResponses: SummaryResponse[];
}

// --------------------------------------------------------------------------
// --- BACKEND RESPONSE SHAPE & TRANSFORM ---
// --------------------------------------------------------------------------

interface FetchReportResponse {
  type: string;
  assignment_id: number;
  assignment_name: string;
  reviews: {
    id: number;
    reviewer: { id: number; user: { id: number; name: string } };
    reviewee: { id: number };
    responses: {
      id: number;
      round: number;
      is_submitted: boolean;
      additional_comment: string | null;
      scores?: {
        id: number;
        answer: number;
        comments: string | null;
        item?: { id: number; txt: string; weight: number };
      }[];
    }[];
  }[];
  reviewer_scores: Record<string, Record<string, Record<string, number>>>;
  reviewer_volumes: Record<string, Record<string, number>>;
  team_averages: Record<string, Record<string, { min: number | null; max: number | null; avg: number | null }>>;
  rubric_ranges: Record<string, { min: number; max: number }>;
  reviewer_grades: Record<number, { grade: number | null; comment: string | null }>;
  instructor_grade_min_score: number | null;
  instructor_grade_max_score: number | null;
}

function transformFetchReportResponse(data: FetchReportResponse): ReviewData[] {
  const reviewsByReviewer = new Map<number, FetchReportResponse["reviews"]>();
  data.reviews.forEach((review) => {
    const existing = reviewsByReviewer.get(review.reviewer.id) ?? [];
    existing.push(review);
    reviewsByReviewer.set(review.reviewer.id, existing);
  });

  // Number of rounds from rubric_ranges keys (e.g. {"1": ..., "2": ...} → 2)
  const numRounds = Object.keys(data.rubric_ranges ?? {}).length || 1;

  const rows: ReviewData[] = [];
  reviewsByReviewer.forEach((reviews, reviewerId) => {
    const reviewer = reviews[0].reviewer;

    // reviewsSelected = teams assigned; reviewsCompleted = teams with ≥1 submission
    const reviewsSelected = reviews.length;
    const reviewsCompleted = reviews.filter((r) =>
      r.responses.some((resp) => resp.is_submitted)
    ).length;

    // Per-round counts: how many teams have a submitted response in each round
    const reviewsPerRound = Array.from({ length: numRounds }, (_, i) => {
      const round = i + 1;
      return {
        round,
        completed: reviews.filter((r) =>
          r.responses.some((resp) => resp.is_submitted && (resp.round ?? 1) === round)
        ).length,
        total: reviewsSelected,
      };
    });

    // Volume per round, computed server-side by VolumeReducer
    const volumeByRound: Record<number, number> = {};
    Object.entries(data.reviewer_volumes?.[reviewerId] ?? {}).forEach(([round, vol]) => {
      volumeByRound[Number(round)] = vol;
    });

    // Comment count per round across all maps for this reviewer
    const commentCountByRound: Record<number, number> = {};
    reviews.forEach((review) => {
      review.responses.forEach((resp) => {
        if (!resp.is_submitted) return;
        const r = resp.round ?? 1;
        commentCountByRound[r] =
          (commentCountByRound[r] ?? 0) +
          (resp.scores?.filter((s) => s.comments).length ?? 0) +
          (resp.additional_comment ? 1 : 0);
      });
    });

    reviews.forEach((review) => {
      const revieweeId = review.reviewee.id;
      const roundScores = data.reviewer_scores?.[reviewerId]?.[revieweeId] ?? {};

      const rounds: ReviewRound[] = Object.entries(roundScores).map(([round, pct]) => {
        const roundNum = Number(round);
        return {
          round: roundNum,
          calculatedScore: pct,
          maxScore: 100,
          reviewVolume: volumeByRound[roundNum] ?? 0,
          reviewCommentCount: commentCountByRound[roundNum] ?? 0,
          teamAvgRange: data.team_averages?.[revieweeId]?.[roundNum] ?? null,
        };
      });

      const hasSubmitted = review.responses.some((r) => r.is_submitted);

      // Status rules matching old implementation:
      // red    — no submission at all
      // blue   — submitted in every round
      // purple — submitted in some rounds but not all
      // brown  — grade assigned (set by handleSaveGrade, not seeded)
      // green  — no work submitted by reviewee (requires due-date data, not yet available)
      const submittedRounds = new Set(
        review.responses.filter((r) => r.is_submitted).map((r) => r.round ?? 1)
      );
      const teamReviewedStatus: ReviewData["teamReviewedStatus"] = !hasSubmitted
        ? "red"
        : submittedRounds.size >= numRounds
          ? "blue"
          : "purple";

      const savedGrade = data.reviewer_grades?.[reviewer.id] ?? null;
      const hasSavedGrade = savedGrade?.grade != null;

      rows.push({
        id: review.id,
        reviewerName: reviewer.user.name,
        reviewerId: reviewer.id,
        reviewsCompleted,
        reviewsSelected,
        reviewsPerRound,
        teamReviewedName: `Team ${revieweeId}`,
        teamReviewedStatus: hasSavedGrade ? "brown" : teamReviewedStatus,
        hasConsent: false,
        calculatedScore: rounds[0]?.calculatedScore ?? null,
        rounds,
        reviewVolume: rounds.reduce((acc, r) => acc + r.reviewVolume, 0),
        reviewCommentCount: rounds.reduce((acc, r) => acc + r.reviewCommentCount, 0),
        assignedGrade: savedGrade?.grade ?? null,
        instructorComment: savedGrade?.comment ?? null,
        summaryResponses: review.responses
          .filter((r) => r.is_submitted)
          .map((r) => ({
            round: r.round ?? 1,
            teamName: `Team ${revieweeId}`,
            scores: (r.scores ?? []).map((s) => ({
              question: s.item?.txt ?? `Question ${s.id}`,
              answer: s.answer,
              comments: s.comments,
            })),
            additionalComment: r.additional_comment,
          })),
      });
    });
  });

  return rows;
}


// --------------------------------------------------------------------------
// --- METRICS CHART ---
// --------------------------------------------------------------------------

interface MultiRoundMetricsChartProps {
  rounds: { round: number; reviewVolume: number; reviewCommentCount: number }[];
  averageVolumeByRound: Record<number, number>;
  totalVolume: number;
  totalAverage: number;
  totalCommentCount: number;
  maxRounds: number;
}

// Colorblind-safe: blue (CB-safe) vs orange
const COLOR_REVIEWER = "#0077BB";
const COLOR_AVG      = "#EE7733";


const SPANNED_COLS = new Set(["reviewerName", "reviewsCompleted", "assignedGrade"]);

// Multi-round chart: 2n+2 bars, all sharing one Y-axis.
// Groups: [R1 Yours, R1 Avg], [R2 Yours, R2 Avg], ..., [All Yours, All Avg]
const MultiRoundMetricsChart: React.FC<MultiRoundMetricsChartProps> = ({
  rounds,
  averageVolumeByRound,
  totalVolume,
  totalAverage,
  totalCommentCount,
  maxRounds,
}) => {
  const roundByNumber = Object.fromEntries(rounds.map((r) => [r.round, r]));
  // Only include rounds where the reviewer actually participated; skip gaps entirely.
  const participatedRounds = Array.from({ length: maxRounds }, (_, i) => {
    const r = roundByNumber[i + 1];
    const yours = r && r.reviewVolume > 0 ? r.reviewVolume : null;
    return { label: `R${i + 1}`, yours, avg: yours !== null && averageVolumeByRound[i + 1] > 0 ? averageVolumeByRound[i + 1] : null };
  }).filter((d) => d.yours !== null);

  const data = [
    ...participatedRounds,
    { label: "All", yours: totalVolume > 0 ? totalVolume : null, avg: totalAverage > 0 ? totalAverage : null },
  ];

  // Scale width to the actual number of slots so bars don't spread across unused space.
  const slotWidth = 75;
  const actualWidth = Math.max(120, participatedRounds.length * slotWidth + slotWidth + 36);

  const allValues = data.flatMap((d) => [d.yours ?? 0, d.avg ?? 0]);
  const yMax = Math.ceil(Math.max(...allValues, 1) * 1.2);

  return (
    <div style={{ display: "inline-block" }}>
      <BarChart width={actualWidth} height={120} data={data} barGap={1} margin={{ top: 4, right: 4, left: -14, bottom: -10 }}>
        <XAxis dataKey="label" tick={{ fontSize: 9 }} />
        <YAxis type="number" domain={[0, yMax]} tick={{ fontSize: 9 }} width={36} />
        <Tooltip formatter={(value: number, key: string) => [`${value} unique words`, key === "yours" ? "Yours" : "Avg"]} />
        <Bar dataKey="yours" name="Yours" maxBarSize={12} fill={COLOR_REVIEWER} isAnimationActive={false} />
        <Bar dataKey="avg"   name="Avg"   maxBarSize={12} fill={COLOR_AVG}      isAnimationActive={false} />
      </BarChart>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: "0.65rem", marginTop: 0 }}>
        <span><span style={{ color: COLOR_REVIEWER, fontWeight: "bold" }}>■</span> Yours</span>
        <span><span style={{ color: COLOR_AVG,      fontWeight: "bold" }}>■</span> Avg</span>
        <span style={{ color: "#999" }}>{totalCommentCount} comments</span>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// --- GRADE/COMMENT CELL ---
// --------------------------------------------------------------------------

const GradeCommentCell: React.FC<{
  review: ReviewData;
  onSave: (id: number, reviewerId: number, grade: number | null, comment: string) => void;
  instructorGradeMin: number | null;
  instructorGradeMax: number | null;
}> = ({ review, onSave, instructorGradeMin, instructorGradeMax }) => {
  const [grade, setGrade] = useState<number | string>(review.assignedGrade ?? "");
  const [comment, setComment] = useState<string>(review.instructorComment ?? "");

  const min = instructorGradeMin ?? 0;
  const max = instructorGradeMax ?? 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") { setGrade(""); return; }
    const num = Number(val);
    setGrade(num < min ? min : num > max ? max : num);
  };

  return (
    <>
      <InputGroup className="mb-2" style={{ width: "fit-content" }}>
        <Form.Control
          type="number"
          placeholder="Grade"
          style={{ width: "80px" }}
          value={grade}
          onChange={handleChange}
        />
        {instructorGradeMax != null && (
          <InputGroup.Text>{min < 0 ? `${min} to ${max}` : `/ ${max}`}</InputGroup.Text>
        )}
      </InputGroup>
      <Form.Control
        as="textarea"
        rows={2}
        placeholder="Instructor Comments"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        className="btn btn-md mt-1"
        variant="outline-secondary"
        onClick={() => onSave(review.id, review.reviewerId, grade === "" ? null : Number(grade), comment)}
      >
        Save
      </Button>
    </>
  );
};

// --------------------------------------------------------------------------
// --- TEAM STATUS HELPERS ---
// --------------------------------------------------------------------------

const STATUS_COLORS: Record<ReviewData["teamReviewedStatus"], string> = {
  red:    "#dc3545",
  blue:   "#0d6efd",
  green:  "#198754",
  purple: "#6f42c1",
  brown:  "#986633",
};

const STATUS_LABELS: Record<ReviewData["teamReviewedStatus"], string> = {
  red:    "Not Completed",
  blue:   "Completed, No Grade",
  green:  "No Submitted Work",
  purple: "Partially Reviewed",
  brown:  "Grade Assigned",
};

// --------------------------------------------------------------------------
// --- COLUMN DEFINITIONS ---
// --------------------------------------------------------------------------

function buildColumns(
  averageVolumeByRound: Record<number, number>,
  averageTotalVolume: number,
  onSave: (id: number, grade: number | null, comment: string) => void,
  allReviewData: ReviewData[],
  maxRounds: number,
  instructorGradeMin: number | null,
  instructorGradeMax: number | null
) {
  return [
    columnHelper.accessor("reviewerName", {
      header: ({ column }) => <SortableHeader label="Reviewer" column={column} />,
      cell: ({ row }) => (
        <Link to={`/users/${row.original.reviewerId}`}>
          <strong>{row.original.reviewerName}</strong>
        </Link>
      ),
    }),
    columnHelper.accessor("reviewsCompleted", {
      header: () => <span className="review-report-th">Reviews Done</span>,
      meta: { minWidth: 150 },
      enableSorting: false,
      cell: ({ row }) => (
        <>
          {row.original.reviewsPerRound.map((r) => (
            <div key={r.round}>
              Round {r.round}: {r.completed}/{r.total}
            </div>
          ))}
          <br />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const allForReviewer = allReviewData.filter((r) => r.reviewerId === row.original.reviewerId);
              const combined = allForReviewer.flatMap((r) => r.summaryResponses);
              openReviewDetail(
                `Review by ${row.original.reviewerName}`,
                summaryResponsesToRoundRows(combined)
              );
            }}
          >
            summary
          </a>
        </>
      ),
    }),
    columnHelper.accessor("teamReviewedName", {
      header: ({ column }) => <SortableHeader label="Team reviewed" column={column} />,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <span style={{ color: STATUS_COLORS[r.teamReviewedStatus], display: "inline-block" }}>
            {r.teamReviewedName} {r.hasConsent && "✔"}
            <br />
            <small>{STATUS_LABELS[r.teamReviewedStatus]}</small>
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "scoresAwarded",
      header: () => <span className="review-report-th">Average Peer Grade</span>,
      meta: { minWidth: 200 },
      enableSorting: false,
      cell: ({ row }) => {
        const { rounds } = row.original;
        if (!rounds.length) return "-";
        const multiRound = rounds.length > 1;
        const scaleMin = instructorGradeMin ?? 0;
        const scaleMax = instructorGradeMax ?? 100;
        const normalize = (pct: number) =>
          Math.round(scaleMin + (pct / 100) * (scaleMax - scaleMin));

        const allPcts = rounds
          .map((r) =>
            r.calculatedScore !== null && r.maxScore && r.maxScore > 0
              ? (r.calculatedScore / r.maxScore) * 100
              : null
          )
          .filter((p): p is number => p !== null);
        const allRoundsAvg = allPcts.length
          ? normalize(allPcts.reduce((a, b) => a + b, 0) / allPcts.length)
          : null;

        return (
          <>
            {rounds.map((round, i) => {
              const pct =
                round.calculatedScore !== null && round.maxScore && round.maxScore > 0
                  ? (round.calculatedScore / round.maxScore) * 100
                  : null;
              const normalized = pct !== null ? normalize(pct) : null;
              const rangeMin = round.teamAvgRange?.min != null ? normalize(round.teamAvgRange.min) : null;
              const rangeMax = round.teamAvgRange?.max != null ? normalize(round.teamAvgRange.max) : null;
              return (
                <div key={i} style={{ marginBottom: "4px", whiteSpace: "nowrap" }}>
                  {multiRound ? `Round ${round.round}: ` : ""}{normalized !== null ? normalized : "-"}
                  {multiRound && round.teamAvgRange && (
                    <span style={{ fontSize: "0.75rem", color: "#6c757d", marginLeft: "6px" }}>
                      Max {rangeMax ?? "-"} | Min {rangeMin ?? "-"}
                    </span>
                  )}
                </div>
              );
            })}
            {multiRound && (
              <div style={{ borderTop: "1px solid #dee2e6", paddingTop: "6px", fontWeight: 500 }}>
                All Rounds: {allRoundsAvg !== null ? allRoundsAvg : "-"}
              </div>
            )}
          </>
        );
      },
    }),
    columnHelper.display({
      id: "metrics",
      header: () => <span className="review-report-th">Metrics (Volume)</span>,
      meta: { minWidth: 220 },
      enableSorting: false,
      cell: ({ row }) => {
        const { rounds } = row.original;
        if (!rounds.length) return "-";

        const totalRawVolume = rounds.reduce((acc, r) => acc + r.reviewVolume, 0);
        if (totalRawVolume === 0) return "-";

        const totalReviewVolume = Math.round(totalRawVolume / rounds.length);
        const totalCommentCount = rounds.reduce((acc, r) => acc + r.reviewCommentCount, 0);

        return (
          <MultiRoundMetricsChart
            rounds={rounds.map((r) => ({
              round: r.round,
              reviewVolume: r.reviewVolume,
              reviewCommentCount: r.reviewCommentCount,
            }))}
            averageVolumeByRound={averageVolumeByRound}
            totalVolume={totalReviewVolume}
            totalAverage={averageTotalVolume}
            totalCommentCount={totalCommentCount}
            maxRounds={maxRounds}
          />
        );
      },
    }),
    columnHelper.accessor("assignedGrade", {
      header: () => (
        <span className="review-report-th">
          Assign grade and write comments{" "}
          <ToolTip
            id="assign-grade-info"
            placement="top"
            info={`Grade scale (${instructorGradeMin ?? 0}–${instructorGradeMax ?? 100}) defaults to the score range of the first review questionnaire. It can be changed in the Review Strategy tab of the assignment.`}
          />
        </span>
      ),
      size: 320,
      minSize: 300,
      enableSorting: false,
      cell: ({ row }) => (
        <GradeCommentCell review={row.original} onSave={onSave} instructorGradeMin={instructorGradeMin} instructorGradeMax={instructorGradeMax} />
      ),
    }),
  ];
}

// --------------------------------------------------------------------------
// --- MAIN COMPONENT ---
// --------------------------------------------------------------------------

const ReviewReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState<ReviewData[]>([]);
  const [averageVolumeByRound, setAverageVolumeByRound] = useState<Record<number, number>>({});
  const [averageTotalVolume, setAverageTotalVolume] = useState<number>(0);
  const [instructorGradeMin, setInstructorGradeMin] = useState<number | null>(null);
  const [instructorGradeMax, setInstructorGradeMax] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: string } | null>(null);
  const [assignmentName, setAssignmentName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showMetrics, setShowMetrics] = useState<boolean>(true);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const hoveredCellsRef = useRef<Element[]>([]);
  const stickyElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!reviewData.length) return;

    const wrapper = tableWrapperRef.current;
    const thead = wrapper?.querySelector("thead");
    const table = wrapper?.querySelector("table");
    if (!thead || !table) return;

    const navbarHeight = (document.querySelector(".navbar") as HTMLElement)?.offsetHeight ?? 0;

    // Build clone once
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
    fixed.style.cssText = `position:fixed;display:none;z-index:1021;overflow:hidden;background:#e2e3e5;box-shadow:0 2px 4px rgba(0,0,0,0.15);pointer-events:none;`;
    fixed.appendChild(cloneTable);
    document.body.appendChild(fixed);
    stickyElRef.current = fixed;

    // Batch reads then writes — no interleaved reflow
    const syncWidths = () => {
      const el = stickyElRef.current;
      if (!el) return;
      const realThs = Array.from(thead.querySelectorAll("th"));
      const cloneThs = Array.from(el.querySelectorAll("th"));
      const metrics = realThs.map((th) => ({
        w: th.getBoundingClientRect().width,
        p: getComputedStyle(th).padding,
      }));
      metrics.forEach(({ w, p }, i) => {
        const cloneTh = cloneThs[i] as HTMLElement;
        if (!cloneTh) return;
        cloneTh.style.cssText = `background:#e2e3e5;border:none;font-weight:600;width:${w}px;min-width:${w}px;box-sizing:border-box;padding:${p};`;
      });
    };
    syncWidths();

    // Cache horizontal position — vertical scrolling doesn't change left/width
    let cachedLeft = 0;
    let cachedWidth = 0;
    const syncPosition = () => {
      const rect = table.getBoundingClientRect();
      cachedLeft = rect.left;
      cachedWidth = rect.width;
    };
    syncPosition();

    let headerHidden = false;
    let tableVisible = false;

    const updateVisibility = () => {
      const el = stickyElRef.current;
      if (!el) return;
      if (headerHidden && tableVisible) {
        el.style.top = `${navbarHeight}px`;
        el.style.left = `${cachedLeft}px`;
        el.style.width = `${cachedWidth}px`;
        el.style.display = "block";
      } else {
        el.style.display = "none";
      }
    };

    // Fires when thead scrolls past the navbar — zero scroll-thread cost
    const headerIO = new IntersectionObserver(
      ([entry]) => { headerHidden = !entry.isIntersecting; updateVisibility(); },
      { rootMargin: `-${navbarHeight}px 0px 0px 0px`, threshold: 0 }
    );
    headerIO.observe(thead);

    // Fires when the table itself leaves the viewport — hides clone at bottom of page
    const tableIO = new IntersectionObserver(
      ([entry]) => { tableVisible = entry.isIntersecting; updateVisibility(); },
      { threshold: 0 }
    );
    tableIO.observe(table);

    // Sync widths and position only on resize, never on scroll
    const ro = new ResizeObserver(() => { syncWidths(); syncPosition(); });
    ro.observe(table);

    return () => {
      headerIO.disconnect();
      tableIO.disconnect();
      ro.disconnect();
      stickyElRef.current?.remove();
      stickyElRef.current = null;
    };
  }, [reviewData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.post<FetchReportResponse>("/reports/generate_report", {
          assignment_id: id,
          type: "review_response_map",
        });
        const transformed = transformFetchReportResponse(response.data);
        setAssignmentName(response.data.assignment_name ?? "");
        setReviewData(transformed);

        // Compute per-round average volume across all reviewers with volume > 0
        // Match old implementation: one volume entry per reviewer per round (not per row),
        // then divide by ALL reviewers so non-participants pull the average down.
        const volByReviewerRound = new Map<number, Record<number, number>>();
        transformed.forEach((r) => {
          if (!volByReviewerRound.has(r.reviewerId)) {
            const roundVols: Record<number, number> = {};
            r.rounds.forEach((rnd) => { roundVols[rnd.round] = rnd.reviewVolume; });
            volByReviewerRound.set(r.reviewerId, roundVols);
          }
        });
        const totalReviewers = volByReviewerRound.size || 1;
        const sumByRound: Record<number, number> = {};
        volByReviewerRound.forEach((roundVols) => {
          Object.entries(roundVols).forEach(([rnd, vol]) => {
            const rn = Number(rnd);
            sumByRound[rn] = (sumByRound[rn] ?? 0) + vol;
          });
        });
        const avgByRound: Record<number, number> = {};
        Object.keys(sumByRound).forEach((r) => {
          avgByRound[Number(r)] = Math.round(sumByRound[Number(r)] / totalReviewers);
        });
        setAverageVolumeByRound(avgByRound);

        const numRounds = Object.keys(sumByRound).length || 1;
        const totalAvg = Math.round(
          Object.values(avgByRound).reduce((a, b) => a + b, 0) / numRounds
        );
        setAverageTotalVolume(totalAvg);

        setInstructorGradeMin(response.data.instructor_grade_min_score ?? null);
        setInstructorGradeMax(response.data.instructor_grade_max_score ?? null);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Failed to fetch data");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSaveGrade = useCallback(async (reviewId: number, reviewerId: number, grade: number | null, comment: string) => {
    try {
      await axiosClient.patch(`/review_reports/${reviewId}/update_grade`, {
        assignedGrade: grade,
        instructorComment: comment,
      });
      setNotification({ msg: "Grade updated successfully", type: "success" });
      // Update all rows for this reviewer — ReviewGrade is per-participant, not per-map.
      setReviewData((prev) =>
        prev.map((r) =>
          r.reviewerId === reviewerId
            ? { ...r, assignedGrade: grade, instructorComment: comment, teamReviewedStatus: "brown" }
            : r
        )
      );
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ msg: "Failed to update grade", type: "danger" });
    }
  }, []);

  const handleExportCSV = () => {
    const headers = ["Reviewer Name", "Team Reviewed", "Score", "Assigned Grade", "Instructor Comment"];
    const csvRows = reviewData.map((r) => [
      `"${r.reviewerName}"`,
      `"${r.teamReviewedName}"`,
      r.calculatedScore,
      r.assignedGrade,
      `"${r.instructorComment || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") + "\n" +
      csvRows.map((row) => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "review_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return reviewData;
    const lower = searchTerm.toLowerCase();
    return reviewData.filter((r) => r.reviewerName.toLowerCase().includes(lower));
  }, [reviewData, searchTerm]);

  const handleRowMouseEnter = useCallback((reviewerId: number) => {
    hoveredCellsRef.current.forEach((el) => el.classList.remove("reviewer-spanned-hovered"));
    const cells = Array.from(tableWrapperRef.current?.querySelectorAll(`[data-rid="${reviewerId}"]`) ?? []);
    cells.forEach((el) => el.classList.add("reviewer-spanned-hovered"));
    hoveredCellsRef.current = cells;
  }, []);

  const handleWrapperMouseLeave = useCallback(() => {
    hoveredCellsRef.current.forEach((el) => el.classList.remove("reviewer-spanned-hovered"));
    hoveredCellsRef.current = [];
  }, []);

  // Precompute per-reviewer: alternating group index and row span for the merged cells.
  const reviewerMeta = useMemo(() => {
    const meta = new Map<number, { groupIdx: number; span: number }>();
    let groupIdx = 0;
    filteredData.forEach((row, i) => {
      if (i > 0 && filteredData[i - 1].reviewerId === row.reviewerId) {
        meta.get(row.reviewerId)!.span++;
      } else {
        if (i > 0) groupIdx++;
        meta.set(row.reviewerId, { groupIdx, span: 1 });
      }
    });
    return meta;
  }, [filteredData]);

  const maxRounds = Object.keys(averageVolumeByRound).length || 1;
  const tableColumns = useMemo(() => {
    const cols = buildColumns(averageVolumeByRound, averageTotalVolume, handleSaveGrade, reviewData, maxRounds, instructorGradeMin, instructorGradeMax);
    return showMetrics ? cols : cols.filter((c) => (c as any).id !== "metrics");
  }, [averageVolumeByRound, averageTotalVolume, handleSaveGrade, reviewData, maxRounds, instructorGradeMin, instructorGradeMax, showMetrics]);

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
    <Container fluid className="p-4 review-report-page">
      {notification && (
        <Alert
          className={`flash_note alert alert-${notification.type}`}
          variant={notification.type}
          onClose={() => setNotification(null)}
          dismissible
        >
          {notification.msg}
        </Alert>
      )}

      <div className="review-report-selector" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn-back-assignment" onClick={() => navigate(`/assignments/edit/${id}`)}>Back</button>
        <select name="reports" id="report-select" defaultValue="review"
          onChange={(e) => {
            if (e.target.value === "teammate") navigate(`/assignments/${id}/teammate-review`);
          }}
        >
          <option value="review">Review report</option>
          <option value="teammate">Teammate Review report</option>
        </select>
      </div>

      <h2 style={{ textAlign: "left" }}>Review Report{assignmentName ? ` — ${assignmentName}` : ""}</h2>

      <div className="review-report-search-row">
        <Form.Label className="mb-0">Reviewer's Name</Form.Label>
        <div className="review-report-search-group">
          <Form.Control
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-secondary">Search</Button>
        </div>
      </div>

      <details className="legend mt-3">
        <summary style={{ cursor: "pointer", fontWeight: "bold" }}>**In "Team reviewed" column text in:</summary>
        <ul>
          <li><span className="legend-red">red</span> indicates that the review is not completed in any rounds;</li>
          <li><span className="legend-blue">blue</span> indicates that a review is completed in every round and the review grade is not assigned;</li>
          <li><span className="legend-green">green</span> indicates that there is no submitted work to review within the round;</li>
          <li><span className="legend-purple">purple</span> indicates that the review is only partially completed (submitted in some rounds but not all);</li>
          <li><span className="legend-brown">brown</span> indicates that the review grade has been assigned;</li>
          <li>✔ Check mark indicates that the student has given consent to make the reviews public</li>
        </ul>
      </details>

      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0 12px" }}>
        <Button variant="outline-secondary" onClick={handleExportCSV}>
          Export Review Scores To CSV File
        </Button>
        <Button variant="outline-secondary" onClick={() => setShowMetrics((v) => !v)}>
          {showMetrics ? "Hide" : "Show"} Metrics
        </Button>
      </div>

      <div className="review-report-table-wrapper" ref={tableWrapperRef} onMouseLeave={handleWrapperMouseLeave}>
        <Table
          data={filteredData}
          columns={tableColumns}
          showGlobalFilter={true}
          showColumnFilter={false}
          showPagination={filteredData.length >= 10}
          getRowClassName={(row, allRows) => {
            const idx = allRows.findIndex((r: any) => r.id === row.id);
            const isFirst = idx === 0 || allRows[idx - 1].original.reviewerId !== row.original.reviewerId;
            const { groupIdx } = reviewerMeta.get(row.original.reviewerId) ?? { groupIdx: 0 };
            const groupClass = groupIdx % 2 !== 0 ? "reviewer-group-row-odd" : "reviewer-group-row-even";
            return isFirst ? `${groupClass} reviewer-group-start` : groupClass;
          }}
          getRowProps={(row) => ({
            onMouseEnter: () => handleRowMouseEnter(row.original.reviewerId),
          })}
          getCellProps={(cell, row, allRows) => {
            if (!SPANNED_COLS.has(cell.column.id)) return {};
            const idx = allRows.findIndex((r: any) => r.id === row.id);
            const isFirst = idx === 0 || allRows[idx - 1].original.reviewerId !== row.original.reviewerId;
            if (!isFirst) return { skip: true };
            const { span } = reviewerMeta.get(row.original.reviewerId) ?? { span: 1 };
            return { rowSpan: span, style: { verticalAlign: "top" }, "data-rid": String(row.original.reviewerId) } as React.TdHTMLAttributes<HTMLTableCellElement>;
          }}
          tableStyle={{ width: "fit-content", margin: 0 }}
        />
      </div>
    </Container>
  );
};

export default ReviewReportPage;

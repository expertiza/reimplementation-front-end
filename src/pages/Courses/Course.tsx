import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "../../hooks/useAPI";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { IoIosAddCircle } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "../../store/slices/alertSlice";
import { RootState } from "../../store/store";
import {
  ICourseResponse,
  IAssignmentResponse,
  IInstructorResponse,
  ROLE,
} from "../../utils/interfaces";
import { hasAllPrivilegesOf } from "../../utils/util";
import { courseColumns as COURSE_COLUMNS } from "./CourseColumns";
import CopyCourse from "./CourseCopy";
import DeleteCourse from "./CourseDelete";
import AssignmentDelete from "../Assignments/AssignmentDelete";
import { getInstructorDisplayName, mergeDataAndNamesAndInstructors } from "./CourseUtil";
import { formatDate } from "../../utils/util";

type UnifiedRow = Record<string, any>;

// Bounds for the Name column; see the nameColumnWidth comment below.
const NAME_MIN_PX = 220;
const NAME_MAX_PX = 330;

const Courses = () => {
  const { error, isLoading, data: CourseResponse, sendRequest: fetchCourses } = useAPI();
  const { data: InstitutionResponse, sendRequest: fetchInstitutions } = useAPI();
  const { data: InstructorResponse, sendRequest: fetchInstructors } = useAPI();
  const { data: assignmentResponse, sendRequest: fetchAssignments } = useAPI();
  const { data: copyResponse, error: copyError, sendRequest: sendCopyRequest } = useAPI();

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteCourseConfirmation, setShowDeleteCourseConfirmation] = useState<{
    visible: boolean;
    data?: ICourseResponse;
  }>({ visible: false });

  const [showCopyConfirmation, setShowCopyConfirmation] = useState<{
    visible: boolean;
    data?: ICourseResponse;
  }>({ visible: false });

  const [showDeleteAssignmentConfirmation, setShowDeleteAssignmentConfirmation] = useState<{
    visible: boolean;
    data?: IAssignmentResponse;
  }>({ visible: false });

  useEffect(() => {
    if (!showDeleteCourseConfirmation.visible && !showCopyConfirmation.visible) {
      fetchCourses({ url: `/courses` });
      fetchInstitutions({ url: `/institutions` });
      fetchInstructors({ url: `/users` });
      fetchAssignments({ url: `/assignments` });
    }
  }, [
    fetchCourses,
    fetchInstitutions,
    fetchInstructors,
    fetchAssignments,
    location,
    showDeleteCourseConfirmation.visible,
    showCopyConfirmation.visible,
    auth.user.id,
  ]);

  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (copyError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: copyError }));
    }
  }, [copyError, dispatch]);

  useEffect(() => {
    if (copyResponse?.data?.id) {
      dispatch(
        alertActions.showAlert({ variant: "success", message: "Assignment copied successfully." })
      );
      navigate(`/assignments/edit/${copyResponse.data.id}`);
    }
  }, [copyResponse, dispatch, navigate]);

  // Course handlers
  const onEditHandle = useCallback(
    (row: TRow<UnifiedRow>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );
  const onTAHandle = useCallback(
    (row: TRow<UnifiedRow>) => navigate(`${row.original.id}/tas`),
    [navigate]
  );
  const onDeleteHandle = useCallback(
    (row: TRow<UnifiedRow>) =>
      setShowDeleteCourseConfirmation({ visible: true, data: row.original as ICourseResponse }),
    []
  );
  const onCopyHandle = useCallback(
    (row: TRow<UnifiedRow>) =>
      setShowCopyConfirmation({ visible: true, data: row.original as ICourseResponse }),
    []
  );
  const handleCreateAssignment = useCallback(
    (_row: TRow<UnifiedRow>) => navigate(`/assignments/new`),
    [navigate]
  );

  // Assignment handlers (for standalone assignments)
  const handleEditAssignment = useCallback(
    (row: TRow<UnifiedRow>) => navigate(`/assignments/edit/${row.original.id}`),
    [navigate]
  );
  const handleDeleteAssignment = useCallback(
    (row: TRow<UnifiedRow>) =>
      setShowDeleteAssignmentConfirmation({
        visible: true,
        data: row.original as IAssignmentResponse,
      }),
    []
  );
  const handleParticipants = useCallback(
    (row: TRow<UnifiedRow>) => navigate(`/assignments/edit/${row.original.id}/participants`),
    [navigate]
  );
  const handleCreateTeams = useCallback(
    (row: TRow<UnifiedRow>) => navigate(`/assignments/edit/${row.original.id}/createteams`),
    [navigate]
  );
  const handleAssignReviewer = useCallback(
    (row: TRow<UnifiedRow>) => navigate(`/assignments/edit/${row.original.id}/assignreviewer`),
    [navigate]
  );
  const handleViewSubmissions = useCallback(
    (row: TRow<UnifiedRow>) => navigate(`/assignments/edit/${row.original.id}/viewsubmissions`),
    [navigate]
  );
  const handleViewScores = useCallback(
    (row: TRow<UnifiedRow>) => navigate(`/assignments/edit/${row.original.id}/viewscores`),
    [navigate]
  );
  const handleViewReports = useCallback(
    (row: TRow<UnifiedRow>) => navigate(`/assignments/${row.original.id}/review`),
    [navigate]
  );
  const handleCopyAssignment = useCallback(
    (row: TRow<UnifiedRow>) => {
      sendCopyRequest({ url: `/assignments/${row.original.id}/copy_assignment`, method: "POST" });
    },
    [sendCopyRequest]
  );
  const handleExportAssignment = useCallback((_row: TRow<UnifiedRow>) => {
    /* not yet implemented */
  }, []);

  const tableColumns = useMemo(
    () =>
      COURSE_COLUMNS(
        onEditHandle,
        onDeleteHandle,
        onTAHandle,
        onCopyHandle,
        handleCreateAssignment,
        handleEditAssignment,
        handleDeleteAssignment,
        handleParticipants,
        handleAssignReviewer,
        handleCreateTeams,
        handleViewReports,
        handleViewScores,
        handleViewSubmissions,
        handleCopyAssignment,
        handleExportAssignment
      ),
    [
      onEditHandle,
      onDeleteHandle,
      onTAHandle,
      onCopyHandle,
      handleCreateAssignment,
      handleEditAssignment,
      handleDeleteAssignment,
      handleParticipants,
      handleAssignReviewer,
      handleCreateTeams,
      handleViewReports,
      handleViewScores,
      handleViewSubmissions,
      handleCopyAssignment,
      handleExportAssignment,
    ]
  );

  const tableData = useMemo(
    () => (isLoading || !CourseResponse?.data ? [] : CourseResponse.data),
    [CourseResponse?.data, isLoading]
  );

  const institutionData = useMemo(
    () => (!InstitutionResponse?.data ? [] : InstitutionResponse.data),
    [InstitutionResponse?.data]
  );

  const instructorData = useMemo(
    () => (!InstructorResponse?.data ? [] : InstructorResponse.data),
    [InstructorResponse?.data]
  );

  const mergedTableData = useMemo(
    () =>
      mergeDataAndNamesAndInstructors(tableData, institutionData, instructorData).map(
        (item: any) => ({
          ...item,
          created_at: formatDate(item.created_at),
          updated_at: formatDate(item.updated_at),
        })
      ),
    [tableData, institutionData, instructorData]
  );

  const loggedInUserRole = auth.user.role;

  const allAssignments = useMemo(
    () => (assignmentResponse?.data as IAssignmentResponse[] | undefined) ?? [],
    [assignmentResponse?.data]
  );

  const unifiedData = useMemo(() => {
    // Resolve assignment instructor_id against the /users list, same as courses
    const instructorById = new Map<number, IInstructorResponse>(
      instructorData.map((u: IInstructorResponse) => [u.id, u])
    );
    const toAssignmentRow = (a: IAssignmentResponse) => {
      const instructor = instructorById.get(a.instructor_id);
      return {
        ...a,
        instructor: instructor
          ? { id: instructor.id, name: getInstructorDisplayName(instructor) }
          : {},
        created_at: a.created_at ? formatDate(a.created_at) : "–",
        updated_at: a.updated_at ? formatDate(a.updated_at) : "–",
        rowType: "assignment" as const,
      };
    };

    // Index assignments by course_id once — O(n+m) instead of O(n×m)
    const byCourseId = new Map<number, IAssignmentResponse[]>();
    for (const a of allAssignments) {
      if (a.course_id != null) {
        const arr = byCourseId.get(a.course_id) ?? [];
        arr.push(a);
        byCourseId.set(a.course_id, arr);
      }
    }

    const isAdmin =
      loggedInUserRole === ROLE.ADMIN.valueOf() || loggedInUserRole === ROLE.SUPER_ADMIN.valueOf();

    const filtered = isAdmin
      ? mergedTableData
      : mergedTableData.filter((c: { instructor_id: number }) => c.instructor_id === auth.user.id);

    const courseRows = filtered.map((c: any) => ({
      ...c,
      rowType: "course" as const,
      subRows: (byCourseId.get(c.id) ?? []).map(toAssignmentRow),
    }));

    const standaloneRows = allAssignments
      .filter((a) => !a.course_id && (isAdmin || a.instructor_id === auth.user.id))
      .map(toAssignmentRow);

    return [...courseRows, ...standaloneRows];
  }, [mergedTableData, loggedInUserRole, auth.user.id, allAssignments, instructorData]);

  // THE TABLE WIDTH MUST BE CALCULATED ONCE AND STAY FIXED FOR BOTH THE EXPANDED
  // AND THE COLLAPSED STATE. Expanding a course must never resize the table.
  //
  // That rules out CSS content sizing (table-layout: auto): the browser only measures
  // the rows it is currently rendering, so a course holding a long assignment name was
  // narrow while collapsed and jumped wider once expanded. Instead measure every name
  // in the dataset — courses AND the assignments nested under them, on screen or not —
  // and pin the Name column to that, clamped to [NAME_MIN_PX, NAME_MAX_PX]. Names too
  // long for the cap wrap. Any future column that sizes to content needs the same
  // treatment, for the same reason.
  const nameColumnWidth = useMemo(() => {
    // Read the cell font once from a detached probe, then measure every name on a
    // canvas. Writing text into a live element and reading its box back forces a
    // layout flush per name; canvas measureText touches no DOM at all.
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;";
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    const font = cs.font || `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    probe.remove();

    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) ctx.font = font;

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    // Mirrors the indent the Name cell applies: depth * 1.5rem + 0.75rem.
    const widthOf = (text: string, depth: number) => {
      const label = text ?? "";
      // Without a canvas context (jsdom) fall back to a rough per-character estimate.
      const textWidth = ctx ? ctx.measureText(label).width : label.length * 7;
      return textWidth + (depth * 1.5 + 0.75) * rem;
    };

    let widest = 0;
    for (const row of unifiedData) {
      widest = Math.max(widest, widthOf(row.name, 0));
      for (const sub of row.subRows ?? []) widest = Math.max(widest, widthOf(sub.name, 1));
    }

    // + the cell's own horizontal padding, before clamping.
    return Math.min(NAME_MAX_PX, Math.max(NAME_MIN_PX, Math.ceil(widest) + 16));
  }, [unifiedData]);

  const sizedColumns = useMemo(
    () =>
      tableColumns.map((col) =>
        col.id === "name"
          ? { ...col, meta: { ...(col.meta as object), width: `${nameColumnWidth}px` } }
          : col
      ),
    [tableColumns, nameColumnWidth]
  );

  return (
    <>
      <Outlet />
      <main className="px-md-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="text-dark mb-0" style={{ fontSize: "2rem", fontWeight: "600" }}>
            Manage Courses &amp; Assignments
          </h1>
          {hasAllPrivilegesOf(auth.user?.role, ROLE.INSTRUCTOR) && (
            <Button
              variant="link"
              onClick={() => navigate("new")}
              title="New Course"
              className="p-0"
            >
              <IoIosAddCircle size={38} color="#6abf69" />
            </Button>
          )}
        </div>

        {showDeleteCourseConfirmation.visible && (
          <DeleteCourse
            courseData={showDeleteCourseConfirmation.data!}
            onClose={() => setShowDeleteCourseConfirmation({ visible: false })}
          />
        )}
        {showCopyConfirmation.visible && (
          <CopyCourse
            courseData={showCopyConfirmation.data!}
            onClose={() => setShowCopyConfirmation({ visible: false })}
          />
        )}
        {showDeleteAssignmentConfirmation.visible && (
          <AssignmentDelete
            assignmentData={showDeleteAssignmentConfirmation.data!}
            onClose={() => setShowDeleteAssignmentConfirmation({ visible: false })}
          />
        )}

        <Table
          showGlobalFilter={false}
          data={unifiedData}
          columns={sizedColumns}
          // fixed, so the declared widths above are the final widths and the table is
          // exactly their sum — the same whether rows are expanded or collapsed.
          tableStyle={{ width: "fit-content", margin: "0 auto", tableLayout: "fixed" }}
          columnVisibility={{
            id: false,
            instructor:
              auth.user.role === ROLE.SUPER_ADMIN.valueOf() ||
              auth.user.role === ROLE.ADMIN.valueOf(),
          }}
          striped={false}
          bordered={true}
          getSubRows={(row) => row.subRows}
          getRowCanExpand={(row) => row.original?.rowType === "course"}
          getCellProps={(cell, row) => {
            // Group-based striping: course + its assignments share the same background
            const groupIdx = row.depth === 0 ? row.index : row.getParentRow()?.index ?? 0;
            const bg = groupIdx % 2 !== 0 ? "rgba(0,0,0,0.05)" : "#ffffff";
            return { style: { backgroundColor: bg } };
          }}
        />
      </main>
    </>
  );
};

export default Courses;

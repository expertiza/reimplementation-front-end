import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { RiHealthBookLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "../../store/store";
import { ICourseResponse, ROLE } from "../../utils/interfaces";
import { courseColumns as COURSE_COLUMNS } from "./CourseColumns";
import CopyCourse from "./CourseCopy";
import DeleteCourse from "./CourseDelete";
import { formatDate, mergeDataAndNamesAndInstructors } from "./CourseUtil";
import CourseAssignments from "./CourseAssignments";
import { ICourseResponse as ICourse } from "../../utils/interfaces";

/**
 * Courses Component: Displays and manages courses, including CRUD operations.
 */

const Courses = () => {
  const { error, isLoading, data: CourseResponse, sendRequest: fetchCourses } = useAPI();
  const { data: InstitutionResponse, sendRequest: fetchInstitutions } = useAPI();
  const { data: InstructorResponse, sendRequest: fetchInstructors } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: ICourseResponse;
  }>({ visible: false });

  const [showCopyConfirmation, setShowCopyConfirmation] = useState<{
    visible: boolean;
    data?: ICourseResponse;
  }>({ visible: false });

  
  useEffect(() => {
    // Ensure the API fetch happens unless modals are active
    if (!showDeleteConfirmation.visible || !showCopyConfirmation.visible) {
      fetchCourses({ url: `/courses` });
      fetchInstitutions({ url: `/institutions` });
      fetchInstructors({ url: `/users` });
    }
  }, [
    fetchCourses,
    fetchInstitutions,
    fetchInstructors,
    location,
    showDeleteConfirmation.visible,
    auth.user.id,
    showCopyConfirmation.visible,
  ]);

  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteCourseHandler = useCallback(
    () => setShowDeleteConfirmation({ visible: false }),
    []
  );

  const onCopyCourseHandler = useCallback(
    () => setShowCopyConfirmation({ visible: false }),
    []
  );

  const onEditHandle = useCallback(
    (row: TRow<ICourseResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onTAHandle = useCallback(
    (row: TRow<ICourseResponse>) => navigate(`${row.original.id}/tas`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<ICourseResponse>) =>
      setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const onCopyHandle = useCallback(
    (row: TRow<ICourseResponse>) =>
      setShowCopyConfirmation({ visible: true, data: row.original }),
    []
  );

const renderSubComponent = useCallback(({ row }: { row: TRow<ICourseResponse> }) => {
	return (
	  <CourseAssignments
		courseId={row.original.id}
		courseName={row.original.name}
	  />
	);
  }, []);

  const tableColumns = useMemo(
    () =>
      COURSE_COLUMNS(onEditHandle, onDeleteHandle, onTAHandle, onCopyHandle),
    [onDeleteHandle, onEditHandle, onTAHandle, onCopyHandle]
  );

  const tableData = useMemo(
    () => (isLoading || !CourseResponse?.data ? [] : CourseResponse.data),
    [CourseResponse?.data, isLoading]
  );

  const institutionData = useMemo(
    () => (isLoading || !InstitutionResponse?.data ? [] : InstitutionResponse.data),
    [InstitutionResponse?.data, isLoading]
  );

  const instructorData = useMemo(
    () => (isLoading || !InstructorResponse?.data ? [] : InstructorResponse.data),
    [InstructorResponse?.data, isLoading]
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

  const visibleCourses = useMemo(() => {
    if (
      loggedInUserRole === ROLE.ADMIN.valueOf() ||
      loggedInUserRole === ROLE.SUPER_ADMIN.valueOf()
    ) {
      return mergedTableData;
    }
    return mergedTableData.filter(
      (CourseResponse: { instructor_id: number }) =>
        CourseResponse.instructor_id === auth.user.id
    );
  }, [mergedTableData, loggedInUserRole]);

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-4 mb-4">
            <Col className="text-center">
              <h1 className="text-dark" style={{ fontSize: "2rem", fontWeight: "600" }}>
                {auth.user.role === ROLE.INSTRUCTOR.valueOf() ? (
                  <>Instructed by: {auth.user.full_name}</>
                ) : auth.user.role === ROLE.TA.valueOf() ? (
                  <>Assisted by: {auth.user.full_name}</>
                ) : (
                  <>Manage Courses</>
                )}
              </h1>
            </Col>
          </Row>
          {/* Admin doenot have the option to create a course but he can create an assignment */}
          {auth.user?.role === ROLE.INSTRUCTOR && (
            <Row>
              <Col md={{ span: 1, offset: 11 }} style={{ paddingBottom: "10px" }}>
                <Button variant="outline-success" onClick={() => navigate("new")}>
                  <RiHealthBookLine />
                </Button>
              </Col>
            </Row>
          )}

          {showDeleteConfirmation.visible && (
            <DeleteCourse
              courseData={showDeleteConfirmation.data!}
              onClose={onDeleteCourseHandler}
            />
          )}
          {showCopyConfirmation.visible && (
            <CopyCourse
              courseData={showCopyConfirmation.data!}
              onClose={onCopyCourseHandler}
            />
          )}

          <Row >
            <Table
              showGlobalFilter={false}
              data={visibleCourses}
              columns={tableColumns}
              columnVisibility={{
                id: false,
                institution: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
                instructor: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
              }}
              renderSubComponent={renderSubComponent}
              getRowCanExpand={() => true}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Courses;

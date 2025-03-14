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
import CourseAssignments from "./CourseAssignments";
import { formatDate, mergeDataAndNames } from "./CourseUtil";

/**
 * @author Atharva Thorve, on December, 2023
 * @author Mrityunjay Joshi on December, 2023
 * @author Mark Feng on December, 2024
 */

const Courses = () => {
  const { error, isLoading, data: CourseResponse, sendRequest: fetchCourses } = useAPI();
  const { data: InstitutionResponse, sendRequest: fetchInstitutions } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // State for delete and copy confirmation modals
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: ICourseResponse;
  }>({ visible: false });

  const [showCopyConfirmation, setShowCopyConfirmation] = useState<{
    visible: boolean;
    data?: ICourseResponse;
  }>({ visible: false });

  useEffect(() => {
    // ToDo: Fix this API in backend so that it the institution name along with the id. Similar to how it is done in users.
    if (!showDeleteConfirmation.visible || !showCopyConfirmation.visible) {
      fetchCourses({ url: `/courses` });
      // ToDo: Remove this API call later after the above ToDo is completed
      fetchInstitutions({ url: `/institutions` });
    }
  }, [
    fetchCourses,
    fetchInstitutions,
    location,
    showDeleteConfirmation.visible,
    auth.user.id,
    showCopyConfirmation.visible,
  ]);

  // Error alert for API errors
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  // Callbacks for handling delete and copy confirmation modals
  const onDeleteCourseHandler = useCallback(
    () => setShowDeleteConfirmation({ visible: false }),
    []
  );

  const onCopyCourseHandler = useCallback(() => setShowCopyConfirmation({ visible: false }), []);

  // Callbacks for navigation and modal handling
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
    (row: TRow<ICourseResponse>) => setShowCopyConfirmation({ visible: true, data: row.original }),
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
    () => COURSE_COLUMNS(onEditHandle, onDeleteHandle, onTAHandle, onCopyHandle),
    [onDeleteHandle, onEditHandle, onTAHandle, onCopyHandle]
  );

  let tableData = useMemo(
  () => {
    if (isLoading || !CourseResponse?.data) {
      // Generate fake courses if no data
      return Array.from({ length: 5 }, (_, idx) => ({
        id: 1000 + idx,
        name: `Course ${idx + 1} - Software Engineering`,
        institution: { id: 1, name: "Test University" },
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
    return CourseResponse.data;
  },
  [CourseResponse?.data, isLoading]
);

  const institutionData = useMemo(
    () => (isLoading || !InstitutionResponse?.data ? [] : InstitutionResponse.data),
    [InstitutionResponse?.data, isLoading]
  );

  tableData = mergeDataAndNames(tableData, institutionData);

  const formattedTableData = tableData.map((item: any) => ({
    ...item,
    created_at: formatDate(item.created_at),
    updated_at: formatDate(item.updated_at),
  }));

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage Courses</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col md={{ span: 1, offset: 11 }} style={{ paddingBottom: "10px" }}>
              <Button variant="outline-success" onClick={() => navigate("new")}>
                <RiHealthBookLine />
              </Button>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteCourse
                courseData={showDeleteConfirmation.data!}
                onClose={onDeleteCourseHandler}
              />
            )}
            {showCopyConfirmation.visible && (
              <CopyCourse courseData={showCopyConfirmation.data!} onClose={onCopyCourseHandler} />
            )}
          </Row>
          <Row>
            <Table
              showGlobalFilter={false}
              data={formattedTableData}
              columns={tableColumns}
              columnVisibility={{
                id: false,
                institution: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
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
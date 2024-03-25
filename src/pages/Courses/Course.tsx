import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row, Tooltip } from "react-bootstrap";
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
import { OverlayTrigger } from "react-bootstrap";

import CourseDetails from "./CourseDetails"; 
import { ICourseResponse as ICourse } from "../../utils/interfaces";

// Courses Component: Displays and manages courses, including CRUD operations.

/**
 * @author Aniket Singh Shaktawat, on March, 2024 
 * @author Pankhi Saini on March, 2024
 * @author Siddharth Shah on March, 2024
 */
const Courses = () => {
  const { error, isLoading, data: CourseResponse, sendRequest: fetchCourses } = useAPI();
  const { data: InstitutionResponse, sendRequest: fetchInstitutions} = useAPI();
  const { data: InstructorResponse, sendRequest: fetchInstructors} = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // show course
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const handleShowDetails = (course: ICourse) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

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
    if (!showDeleteConfirmation.visible || !showCopyConfirmation.visible){
      fetchCourses({ url: `/courses` });
      // ToDo: Remove this API call later after the above ToDo is completed
      fetchInstitutions({ url: `/institutions` });
      fetchInstructors({ url: `/users` });
    }
  }, [fetchCourses, fetchInstitutions,fetchInstructors, location, showDeleteConfirmation.visible, auth.user.id, showCopyConfirmation.visible]);

  // Error alert for API errors
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  // Callbacks for handling delete and copy confirmation modals
  const onDeleteCourseHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

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
    (row: TRow<ICourseResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const onCopyHandle = useCallback(
    (row: TRow<ICourseResponse>) => setShowCopyConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => COURSE_COLUMNS(onEditHandle, onDeleteHandle, onTAHandle, onCopyHandle, handleShowDetails),
    [onDeleteHandle, onEditHandle, onTAHandle, onCopyHandle, handleShowDetails]
  );

  let tableData = useMemo(
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
  
  tableData = mergeDataAndNamesAndInstructors(tableData, institutionData, instructorData);

  const formattedTableData = tableData.map((item: any) => ({
    ...item,
    created_at: formatDate(item.created_at),
    updated_at: formatDate(item.updated_at),
  }));

    // `auth.user.id` holds the ID of the logged-in user
    const loggedInUserId = auth.user.id;
    const loggedInUserRole = auth.user.role;

    const visibleCourses = useMemo(() => {
      // Show all courses to admin and superadmin roles
      if (loggedInUserRole === ROLE.ADMIN.valueOf() || loggedInUserRole === ROLE.SUPER_ADMIN.valueOf()) {
        return formattedTableData;
      }
      // Otherwise, only show courses where the logged-in user is the instructor
      return formattedTableData.filter((CourseResponse: { instructor_id: number; }) => CourseResponse.instructor_id === loggedInUserId);
    }, [formattedTableData, loggedInUserRole]);

  // Render the Courses component
  
  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>
              {auth.user.role === ROLE.INSTRUCTOR.valueOf() ? (
                <>
                  Instructed by: {auth.user.full_name}
                </>
              ) : auth.user.role === ROLE.TA.valueOf() ? (
                <>
                  Assisted by: {auth.user.full_name}
                </>
              ) : (
                <>
                  Manage Courses
                </>
              )}
              </h1>
            </Col>
            <hr />
          </Row>
          <Row>

            <Col md={{ span: 1, offset: 11 }} style={{paddingBottom: "10px"}}>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Add New Course</Tooltip>}
              >
              <Button variant="outline-success" onClick={() => navigate("new")}>
                <RiHealthBookLine />
              </Button>
              </OverlayTrigger>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteCourse courseData={showDeleteConfirmation.data!} onClose={onDeleteCourseHandler} />
            )}
            {showCopyConfirmation.visible && (
              <CopyCourse courseData={showCopyConfirmation.data!} onClose={onCopyCourseHandler} />
            )}
          </Row>
          <Row>
            <Table
              showGlobalFilter={false}
              data={visibleCourses}
              columns={tableColumns}
              columnVisibility={{
                id: false,
                institution: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
                instructor: auth.user.role === ROLE.SUPER_ADMIN.valueOf(),
              }}
            />
          </Row>
        </Container>
      </main>
      <CourseDetails show={showDetailsModal} onHide={() => setShowDetailsModal(false)} course={selectedCourse} />
    </>
  );
};

export default Courses;

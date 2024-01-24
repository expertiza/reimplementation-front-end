import React from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AdministratorLayout from "./layout/Administrator";
import ManageUserTypes, { loader as loadUsers } from "./pages/Administrator/ManageUserTypes";
import Login from "./pages/Authentication/Login";
import Logout from "./pages/Authentication/Logout";
import InstitutionEditor, { loadInstitution } from "./pages/Institutions/InstitutionEditor";
import Institutions, { loadInstitutions } from "./pages/Institutions/Institutions";
import RoleEditor, { loadAvailableRole } from "./pages/Roles/RoleEditor";
import Roles, { loadRoles } from "./pages/Roles/Roles";
import Assignment from './pages/Assignments/Assignment'
import AssignmentEditor from "pages/Assignments/AssignmentEditor";
import ErrorPage from "./router/ErrorPage";
import NotFound from "./router/NotFound";
import ProtectedRoute from "./router/ProtectedRoute";
import { ROLE } from "./utils/interfaces";
import RootLayout from "layout/Root";
import UserEditor from "./pages/Users/UserEditor";
import Users from "./pages/Users/User";
import { loadUserDataRolesAndInstitutions } from "./pages/Users/userUtil";
import Home from "pages/Home";
import Questionnaire from "pages/EditQuestionnaire/Questionnaire";
import Courses from "pages/Courses/Course";
import CourseEditor from "pages/Courses/CourseEditor";
import { loadCourseInstructorDataAndInstitutions } from "pages/Courses/CourseUtil";
import TA from "pages/TA/TA";
import TAEditor from "pages/TA/TAEditor";
import { loadTAs } from "pages/TA/TAUtil";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <ProtectedRoute element={<Home />} /> },
        { path: "login", element: <Login /> },
        { path: "logout", element: <ProtectedRoute element={<Logout />} /> },
        {path: "edit-questionnaire", element: <ProtectedRoute element={<Questionnaire />} /> },
        {
          path: "assignments",
          element: <ProtectedRoute element={<Assignment />} leastPrivilegeRole={ROLE.TA} />, // Adjust as needed
          children: [
            {
              path: "new",
              element: <AssignmentEditor mode="create" />,
              loader: loadAssignment,
            },
            {
              path: "edit/:id",
              element: <AssignmentEditor mode="update" />,
              loader: loadAssignment,
            },
          ],
        },
        {
          path: "users",
          element: <ProtectedRoute element={<Users />} leastPrivilegeRole={ROLE.TA} />,
          children: [
            {
              path: "new",
              element: <UserEditor mode="create" />,
              loader: loadUserDataRolesAndInstitutions,
            },
            {
              path: "edit/:id",
              element: <UserEditor mode="update" />,
              loader: loadUserDataRolesAndInstitutions,
            },
          ],
        },
        {
          // Routing for courses, so the URL will be https://<domain>.com/courses
          // This route is protected and only TAs can view it.
          path: "courses",
          element: <ProtectedRoute element={<Courses />} leastPrivilegeRole={ROLE.TA} />,
          children: [
            // Child route for courses https://<domain>.com/courses/new
            // The loader runs the function it has been provided with when the component is loaded on the DOM
            {
              path: "new",
              element: <CourseEditor mode="create" />,
              loader: loadCourseInstructorDataAndInstitutions,
            },
            // Child route for courses https://<domain>.com/courses/edit/:id
            {
              path: "edit/:id",
              element: <CourseEditor mode="update" />,
              loader: loadCourseInstructorDataAndInstitutions,
            },
            // Child route for courses https://<domain>.com/courses/:courseId/tas
            {
              path: ":courseId/tas",
              element: <ProtectedRoute element={<TA />} leastPrivilegeRole={ROLE.TA} />,
              children: [
                // Child route for TA component https://<domain>.com/courses/:courseId/tas/new
                {
                  path: "new",
                  element: <TAEditor mode="create" />,
                  loader: loadTAs,
                },
              ]
            },
            // ToDo: Integrate Course Participants here. More information for it can be found: https://github.com/expertiza/reimplementation-front-end/pull/17
            // This can be done in the same way as how it is done for TAs
            // Where we reroute the user to appropriate page by selecting a specific course id and then display all the participants.
          ],
        },
        {
          path: "administrator",
          element: (
            <ProtectedRoute element={<AdministratorLayout />} leastPrivilegeRole={ROLE.ADMIN} />
          ),
          children: [
            {
              id: "roles",
              path: "roles",
              element: <Roles />,
              loader: loadRoles,
              children: [
                {
                  path: "new",
                  element: <RoleEditor mode="create" />,
                },
                {
                  id: "edit-role",
                  path: "edit/:id",
                  element: <RoleEditor mode="update" />,
                  loader: loadAvailableRole,
                },
              ],
            },
            {
              path: "institutions",
              element: <Institutions />,
              loader: loadInstitutions,
              children: [
                {
                  path: "new",
                  element: <InstitutionEditor mode="create" />,
                },
                {
                  path: "edit/:id",
                  element: <InstitutionEditor mode="update" />,
                  loader: loadInstitution,
                },
              ],
            },
            {
              path: ":user_type",
              element: <ManageUserTypes />,
              loader: loadUsers,
              children: [
                {
                  path: "new",
                  element: <Navigate to="/users/new" />,
                },
                {
                  path: "edit/:id",
                  element: <Navigate to="/users/edit/:id" />,
                },
              ],
            },
          ],
        },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

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
import Assignment from "./pages/Assignments/Assignment";
import AssignmentEditor from "./pages/Assignments/AssignmentEditor";
import { loadAssignment } from "pages/Assignments/AssignmentUtil";
import ErrorPage from "./router/ErrorPage";
import ProtectedRoute from "./router/ProtectedRoute";
import { ROLE } from "./utils/interfaces";
import NotFound from "./router/NotFound";
import Participants from "pages/Participants/Participant";
import ParticipantEditor from "pages/Participants/ParticipantEditor";
import { loadParticipantDataRolesAndInstitutions } from "pages/Participants/participantUtil";
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
import ReviewTable from "./pages/ViewTeamGrades/ReviewTable";
import EditProfile from "pages/Profile/Edit";
import Reviews from "pages/Reviews/reviews";
import Email_the_author from "./pages/Email_the_author/email_the_author";
import CreateTeams from "pages/Assignments/CreateTeams";
import AssignReviewer from "pages/Assignments/AssignReviewer";
import ViewSubmissions from "pages/Assignments/ViewSubmissions";
import ViewScores from "pages/Assignments/ViewScores";
import ViewReports from "pages/Assignments/ViewReports";
import ViewDelayedJobs from "pages/Assignments/ViewDelayedJobs";
import ImpersonateUser from "pages/Impersonate/ImpersonateUser";
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
        // Add the ViewTeamGrades route
        {
          path: "view-team-grades",
          element: <ProtectedRoute element={<ReviewTable />} />,
        },
        {
          path: "edit-questionnaire",
          element: <ProtectedRoute element={<Questionnaire />} />,
        },
        {
          path: "assignments/edit/:id/createteams",
          element: <CreateTeams />,
          loader: loadAssignment,
        },

        {
          path: "assignments/edit/:id/assignreviewer",
          element: <AssignReviewer />,
          loader: loadAssignment,
        },
        {
          path: "assignments/edit/:id/viewsubmissions",
          element: <ViewSubmissions />,
          loader: loadAssignment,
        },
        {
          path: "assignments/edit/:id/viewscores",
          element: <ViewScores />,
          loader: loadAssignment,
        },
        {
          path: "assignments/edit/:id/viewreports",
          element: <ViewReports />,
          loader: loadAssignment,
        },
        {
          path: "assignments/edit/:id/viewdelayedjobs",
          element: <ViewDelayedJobs />,
          loader: loadAssignment,
        },
        {
          path: "assignments",
          element: <ProtectedRoute element={<Assignment />} leastPrivilegeRole={ROLE.TA} />,
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
          path: "student_tasks/participants",
          element: <Participants type="student_tasks" id={1} />,
          children: [
            {
              path: "new",
              element: <ParticipantEditor mode="create" type="student_tasks" />,
              loader: loadParticipantDataRolesAndInstitutions,
            },
            {
              path: "edit/:id",
              element: <ParticipantEditor mode="update" type="student_tasks" />,
              loader: loadParticipantDataRolesAndInstitutions,
            },
          ],
        },
        {
          path: "profile",
          element: <ProtectedRoute element={<EditProfile />} />,
        },
        {
          path: "assignments/edit/:assignmentId/participants",
          element: <Participants type="student_tasks" id={1} />,
          children: [
            {
              path: "new",
              element: <ParticipantEditor mode="create" type="assignments" />,
              loader: loadParticipantDataRolesAndInstitutions,
            },
            {
              path: "edit/:id",
              element: <ParticipantEditor mode="update" type="assignments" />,
              loader: loadParticipantDataRolesAndInstitutions,
            },
          ],
        },
        {
          path: "student_tasks/edit/:assignmentId/participants",
          element: <Participants type="student_tasks" id={1} />,
          children: [
            {
              path: "new",
              element: <ParticipantEditor mode="create" type="student_tasks" />,
              loader: loadParticipantDataRolesAndInstitutions,
            },
            {
              path: "edit/:id",
              element: <ParticipantEditor mode="update" type="student_tasks" />,
              loader: loadParticipantDataRolesAndInstitutions,
            },
          ],
        },
        {
          path: "courses/participants",
          element: <Participants type="courses" id={1} />,
          children: [
            {
              path: "new",
              element: <ParticipantEditor mode="create" type="courses" />,
              loader: loadParticipantDataRolesAndInstitutions,
            },
            {
              path: "edit/:id",
              element: <ParticipantEditor mode="update" type="courses" />,
              loader: loadParticipantDataRolesAndInstitutions,
            },
          ],
        },
        {
          path: "reviews",
          element: <Reviews/>,
        },
        {
          path: "email_the_author",
          element: <Email_the_author/>,
        },
        // Fixed the missing comma and added an opening curly brace
        {
          path: "courses",
          element: <ProtectedRoute element={<Courses />} leastPrivilegeRole={ROLE.TA} />,
          children: [
            {
              path: "new",
              element: <CourseEditor mode="create" />,
              loader: loadCourseInstructorDataAndInstitutions,
            },
            {
              path: "edit/:id",
              element: <CourseEditor mode="update" />,
              loader: loadCourseInstructorDataAndInstitutions,
            },
            {
              path: ":courseId/tas",
              element: <ProtectedRoute element={<TA />} leastPrivilegeRole={ROLE.TA} />,
              children: [
                {
                  path: "new",
                  element: <TAEditor mode="create" />,
                  loader: loadTAs,
                },
              ],
            },
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
            {
              path: "questionnaire",
              element: <Questionnaire />,
            },
          ],
        },
        {
          path: "impersonate",
          element: <ProtectedRoute element={<ImpersonateUser />} />,
        },
        { path: "*", element: <NotFound /> },
        { path: "questionnaire", element: <Questionnaire /> }, // Added the Questionnaire route
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

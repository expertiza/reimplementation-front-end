import RootLayout from "layout/Root";
import Home from "pages/Home";
import Participants from "pages/Participants/Participant";
import ParticipantEditor from "pages/Participants/ParticipantEditor";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AdministratorLayout from "./layout/Administrator";
import ManageUserTypes, { loader as loadUsers } from "./pages/Administrator/ManageUserTypes";
import Login from "./pages/Authentication/Login";
import Logout from "./pages/Authentication/Logout";
import InstitutionEditor, { loadInstitution } from "./pages/Institutions/InstitutionEditor";
import Institutions, { loadInstitutions } from "./pages/Institutions/Institutions";
import { loadParticipantDataRolesAndInstitutions } from "./pages/Participants/participantUtil";
import RoleEditor, { loadAvailableRole } from "./pages/Roles/RoleEditor";
import Roles, { loadRoles } from "./pages/Roles/Roles";
import Users from "./pages/Users/User";
import UserEditor from "./pages/Users/UserEditor";
import { loadUserDataRolesAndInstitutions } from "./pages/Users/userUtil";
import ErrorPage from "./router/ErrorPage";
import NotFound from "./router/NotFound";
import ProtectedRoute from "./router/ProtectedRoute";
import { ROLE } from "./utils/interfaces";

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
          element: <Participants type="student_tasks" />,
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
          ]
        },
        {
          path: "courses/participants",
          element: <Participants type="courses" />,
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

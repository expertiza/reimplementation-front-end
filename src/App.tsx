import InstitutionEditor, { loadInstitution } from "./pages/Institutions/InstitutionEditor";
import Institutions, { loadInstitutions } from "./pages/Institutions/Institutions";
import ManageUserTypes, { loader as loadUsers } from "./pages/Administrator/ManageUserTypes";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import RoleEditor, { loadAvailableRole } from "./pages/Roles/RoleEditor";
import Roles, { loadRoles } from "./pages/Roles/Roles";

import AdministratorLayout from "./layout/Administrator";
import Assignment from './pages/Assignments/Assignment'
import AssignmentEditor from "pages/Assignments/AssignmentEditor";
import ErrorPage from "./router/ErrorPage";
import Home from "pages/Home";
import Login from "./pages/Authentication/Login";
import Logout from "./pages/Authentication/Logout";
import NotFound from "./router/NotFound";
import ProtectedRoute from "./router/ProtectedRoute";
import { ROLE } from "./utils/interfaces";
import React from "react";
import RootLayout from "layout/Root";
import UserEditor from "./pages/Users/UserEditor";
import Users from "./pages/Users/User";
import { loadUserDataRolesAndInstitutions } from "./pages/Users/userUtil";

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
          path: "assignments",
          element: <ProtectedRoute element={<Assignment />} leastPrivilegeRole={ROLE.TA} />, // Adjust as needed
          children: [
            {
              path: "new",
              element: <AssignmentEditor mode="create" />,
              loader: loadUserDataRolesAndInstitutions,
            },
            {
              path: "edit/:id",
              element: <AssignmentEditor mode="update" />,
              loader: loadUserDataRolesAndInstitutions,
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

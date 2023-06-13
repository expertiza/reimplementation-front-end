import RootLayout from "layout/Root";
import Home from "pages/Home";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Users from "./pages/Users/User";
import UserEditor from "./pages/Users/UserEditor";
import { loadUserDataRolesAndInstitutions } from "./pages/Users/userUtil";
import ErrorPage from "./utils/ErrorPage";
import Institutions, { loadInstitutions } from "./pages/Institutions/Institutions";
import InstitutionEditor, { loadInstitution } from "./pages/Institutions/InstitutionEditor";
import Roles, { loadRoles } from "./pages/Roles/Roles";
import RoleEditor, { loadAvailableRoles } from "./pages/Roles/RoleEditor";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home /> },
        {
          path: "users",
          element: <Users />,
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
              loader: loadAvailableRoles,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

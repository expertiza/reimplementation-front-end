import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROLE } from "../utils/interfaces";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import AccessDenied from "./AccessDenied";
import { hasAllPrivilegesOf } from "../utils/util";

/**
 * @author Ankur Mundra on June, 2023
 */

interface IProtectedRouteProps {
  element: React.ReactElement;
  leastPrivilegeRole?: ROLE;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  element,
  leastPrivilegeRole = ROLE.STUDENT,
}) => {
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const { isAuthenticated, user } = auth;
  const location = useLocation();

  if (!isAuthenticated) {
    const from = location.pathname === "/logout" ? "/" : location.pathname;
    return <Navigate to="/login" state={{ from: from }} />;
  }

  if (!hasAllPrivilegesOf(user.role, leastPrivilegeRole)) {
    return (
      <AccessDenied
        message={`You are not authorized for this action! Requires at least ${leastPrivilegeRole.valueOf()} role`}
      />
    );
  }
  return element;
};

export default ProtectedRoute;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { authenticationActions } from "../../store/slices/authenticationSlice";

/**
 * @author Ankur Mundra on June, 2023
 */

const Logout: React.FC = () => {
  const auth = useSelector((state: RootState) => state.authentication);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      localStorage.removeItem("token");
      localStorage.removeItem("expiration");
      dispatch(authenticationActions.removeAuthentication());
    }
    navigate("/login");
  }, [auth.isAuthenticated, navigate, dispatch]);

  return null;
};
export default Logout;

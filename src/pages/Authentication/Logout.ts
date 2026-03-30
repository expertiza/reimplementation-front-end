import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { persistor } from "../../store/store";
import { authenticationActions } from "../../store/slices/authenticationSlice";

/**
 * @author Ankur Mundra on June, 2023
 */

const Logout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Always wipe client auth. Previously we only cleared when isAuthenticated was true, which
    // could skip cleanup if this ran before redux-persist rehydration — leaving an admin JWT
    // and persisted super-admin user while the UI looked "logged out".
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("session");
    dispatch(authenticationActions.removeAuthentication());
    void persistor.purge();
    navigate("/login");
  }, [navigate, dispatch]);

  return null;
};
export default Logout;

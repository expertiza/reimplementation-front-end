import React, { useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authenticationActions } from "../../store/slices/authenticationSlice";
import { alertActions } from "../../store/slices/alertSlice";
import { setAuthToken } from "../../utils/auth";
import axios from "axios";

const OidcCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: `Authentication was denied: ${error}`,
          title: "OIDC login failed",
        })
      );
      navigate("/login");
      return;
    }

    if (!code || !state) {
      navigate("/login");
      return;
    }

    axios
      .post("http://localhost:3002/auth/callback", { code, state })
      .then((response) => {
        const payload = setAuthToken(response.data.token);

        localStorage.setItem("session", JSON.stringify({ user: payload }));

        dispatch(
          authenticationActions.setAuthentication({
            authToken: response.data.session_token,
            user: payload,
          })
        );
        navigate(location.state?.from ? location.state.from : "/");
      })
      .catch((error) => {
        dispatch(
          alertActions.showAlert({
            variant: "danger",
            message: error.response?.data?.error || error.message,
            title: "OIDC login failed",
          })
        );
        navigate("/login");
      });
  }, []);

  return (
    <div className="d-flex justify-content-center mt-5">
      <p>Completing login...</p>
    </div>
  );
};

export default OidcCallback;

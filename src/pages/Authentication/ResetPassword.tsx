import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  // Ensure the token is present when the component mounts
  useEffect(() => {
    if (!token) {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: "Invalid or missing token.",
        })
      );
      navigate("/login");
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {


    if (password.length < 6) {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: "Password should be at least 6 letters long."
        })
      );
      return;
    }
    else if (password !== confirmPassword) {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: "Passwords do not match."
        })
      );
      return;
    }
    else {
      try {
        // Send password reset request to the backend
        await axios.put(`${API_BASE_URL}/password_resets/${token}`, {
          user: { password },
        });

        dispatch(
          alertActions.showAlert({
            variant: "success",
            message: `Password Successfully Updated`,
          })
        );

        navigate("/login");

      } catch (error) {
        if (error instanceof AxiosError && error.response && error.response.data) {
          const { error: errorMessage} = error.response.data;
          if (errorMessage) {
            dispatch(
              alertActions.showAlert({
                variant: "danger",
                message: errorMessage,
              })
            );
          }
        }
      }
    }
  };

  return (
    <div style={{padding: "20px"}}>
      <div>
        <h2>Reset Your Password</h2>
      </div>
      Password:
      <br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{marginTop: '5px', marginBottom: '5px', height: '20px', border: '1px solid black'}}
      />
      <br />
      Confirm Password:
      <br />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        style={{marginTop: '5px', marginBottom: '5px', height: '20px', border: '1px solid black'}}
      />
      <br />
      <button type="submit" onClick={handleSubmit} style={{marginTop: '5px', marginBottom: '5px', border: '1px solid black'}}>Reset Password</button>
    </div>
  );
};

export default ResetPassword;

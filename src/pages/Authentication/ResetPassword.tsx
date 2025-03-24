import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

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
        await axios.put(`http://localhost:3002/api/v1/password_resets/${token}`, {
          user: { password },
        });

        navigate("/login")

        dispatch(
          alertActions.showAlert({
            variant: "success",
            message: `Password Successfully Updated`,
          })
        );

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

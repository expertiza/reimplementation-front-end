import React, {useState} from "react";
import axios, { AxiosError } from 'axios';
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";

const ForgotPassword = () =>{

  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {

    try {
      await axios.post("http://localhost:3002/api/v1/password_resets", { email });

      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `A link to reset your password has been sent to your e-mail address.`,
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
  };


  return (
    <div style={{padding: "20px"}}>
      <div>
        <h2>Forgotten Your Password?</h2>
      </div>
      <div>
        Enter the e-mail address associated with your account
      </div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{marginTop: '5px', marginBottom: '5px', height: '20px', border: '1px solid black'}}
      />
      <br />
      <button type="submit" onClick={handleSubmit} style={{marginTop: '5px', marginBottom: '5px', border: '1px solid black'}}>Request Password</button>
    </div>
  );

};

export default ForgotPassword;
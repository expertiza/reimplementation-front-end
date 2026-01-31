import React from "react";
import Alert from "react-bootstrap/Alert";
import { useDispatch } from "react-redux";
import { alertActions } from "../store/slices/alertSlice";

/**
 * @author Ankur Mundra on May, 2023
 */

interface IAlertProps {
  variant: string;
  title?: string;
  message: string;
}

const AlertMessage: React.FC<IAlertProps> = (props) => {
  const dispatch = useDispatch();
  const hideAlertHandler = () => dispatch(alertActions.hideAlert());

  return (
    <Alert
      variant={props.variant}
      onClose={hideAlertHandler}
      dismissible
      className="mb-0 text-left"
      style={{ borderRadius: 0, width: "100%", whiteSpace: "nowrap" }}
    >
      {props.title && <strong>{props.title}: </strong>}
      {props.message}
    </Alert>
  );
};

export default AlertMessage;

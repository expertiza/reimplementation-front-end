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
    <Alert variant={props.variant} onClose={hideAlertHandler} dismissible>
      {props.title && <Alert.Heading>{props.title}</Alert.Heading>}
      <p>{props.message}</p>
    </Alert>
  );
};

export default AlertMessage;

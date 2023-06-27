import { combineReducers } from "@reduxjs/toolkit";
import alertReducer from "./slices/alertSlice";
import authReducer from "./slices/authenticationSlice";

/**
 * @author Ankur Mundra on May, 2023
 */

const rootReducer = combineReducers({
  alert: alertReducer,
  authentication: authReducer,
});
export default rootReducer;

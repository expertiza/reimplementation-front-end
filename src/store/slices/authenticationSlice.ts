import { createSlice } from "@reduxjs/toolkit";
import { ILoggedInUser } from "../../utils/interfaces";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

/**
 * @author Ankur Mundra on June, 2023
 */

const initialAuthenticationState: {
  isAuthenticated: boolean;
  authToken: string;
  user: ILoggedInUser;
} = {
  isAuthenticated: false,
  authToken: "",
  user: { id: 0, name: "", full_name: "", role: "", institution_id: 0 },
};

const authenticationSlice = createSlice({
  name: "authentication",
  initialState: initialAuthenticationState,
  reducers: {
    setAuthentication(state, action) {
      state.isAuthenticated = true;
      state.authToken = action.payload.authToken;
      state.user = action.payload.user;
    },
    removeAuthentication(state) {
      state.isAuthenticated = false;
      state.authToken = "";
      state.user = initialAuthenticationState.user;
    },
  },
});

const persistConfig = {
  key: "authentication",
  storage,
};

const persistedAuthenticationSlice = persistReducer(persistConfig, authenticationSlice.reducer);

export const authenticationActions = authenticationSlice.actions;
export default persistedAuthenticationSlice;

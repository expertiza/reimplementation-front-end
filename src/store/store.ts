import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

/**
 * @author Ankur Mundra on May, 2023
 */

const store = configureStore({ reducer: rootReducer });

export default store;
export type RootState = ReturnType<typeof store.getState>;

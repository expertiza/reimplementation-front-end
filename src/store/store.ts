import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { FLUSH, PAUSE, PERSIST, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";

/**
 * @author Ankur Mundra on May, 2023
 */

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

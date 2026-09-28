import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userslice';
import requestReducer from "./Requestslice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    requests: requestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userslice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Export these two types so TypeScript knows the shape of your entire Redux store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface RequestsState {
  pendingCount: number | null; // null = not yet fetched
}

const initialState: RequestsState = {
  pendingCount: null,
};

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    // set the count directly — used whenever we actually fetch the real list
    setPendingCount: (state, action: PayloadAction<number>) => {
      state.pendingCount = action.payload;
    },
    // used right after an accept/reject succeeds, so the badge updates instantly
    // without waiting for a re-fetch
    decrementPendingCount: (state) => {
      if (state.pendingCount !== null && state.pendingCount > 0) {
        state.pendingCount -= 1;
      }
    },
  },
});

export const { setPendingCount, decrementPendingCount } = requestSlice.actions;
export default requestSlice.reducer;
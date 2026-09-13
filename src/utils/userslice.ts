import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
}
const initialState = null as User | null;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      return action.payload;
    },
    removeUser: () => {
      return null;
    }
  }
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
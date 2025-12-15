import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const loadAuthFromStorage = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decodedUser = jwtDecode(token);
      return {
        token: token,
        user: decodedUser,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Invalid token found in storage", error);
    localStorage.removeItem("accessToken");
  }
  return {
    token: null,
    user: null,
    isAuthenticated: false,
  };
};

const initialState = loadAuthFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { accessToken } = action.payload;
      state.token = accessToken;

      if (accessToken) {
        state.user = jwtDecode(accessToken);
        state.isAuthenticated = true;
        localStorage.setItem("accessToken", accessToken);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;

export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

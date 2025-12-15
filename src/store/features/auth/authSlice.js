import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadAuthFromStorage = () => {
  try {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("id");
    const fullName = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    const roleId = localStorage.getItem("roleId");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    return {
      token: token || null,
      user: {
        id: id || null,
        fullName: fullName || null,
        email: email || null,
        roleId: roleId ? parseInt(roleId) : null,
      },
      isAuthenticated: isAuthenticated,
    };
  } catch (error) {
    console.error("Error loading auth from localStorage:", error);
  }
  return {
    token: null,
    user: {
      id: null,
      fullName: null,
      email: null,
      roleId: null,
    },
    isAuthenticated: false,
  };
};

const initialState = loadAuthFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      const { token, ...user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = Boolean(token);
      // Persist to separate localStorage keys
      localStorage.setItem("token", token || "");
      localStorage.setItem("id", user.id || "");
      localStorage.setItem("fullName", user.fullName || "");
      localStorage.setItem("email", user.email || "");
      localStorage.setItem("roleId", user.roleId?.toString() || "");
      localStorage.setItem("isAuthenticated", state.isAuthenticated.toString());
    },
    logout: (state) => {
      state.token = null;
      state.user = {
        id: null,
        fullName: null,
        email: null,
        roleId: null,
      };
      state.isAuthenticated = false;
      // Remove from separate localStorage keys
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("roleId");
      localStorage.setItem("isAuthenticated", "false");
    },
  },
});

export const { setToken, logout } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectUserId = (state) => state.auth.user?.id;
export const selectUserEmail = (state) => state.auth.user?.email;
export const selectUserFullName = (state) => state.auth.user?.fullName;
export const selectUserRoleId = (state) => state.auth.user?.roleId;

export default authSlice.reducer;

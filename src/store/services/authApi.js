import { api } from "./api";
import { setToken, logout } from "../features/auth/authSlice";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({ url: "/user/login", method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data));
          dispatch(authApi.util.invalidateTags(["Auth"]));
        } catch {
          // no-op; error handled by component
        }
      },
    }),

    register: build.mutation({
      query: (body) => ({
        url: "/user/register",
        method: "POST",
        body,
      }),
    }),

    logoutServer: build.mutation({
      queryFn: () => ({ data: null }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutServerMutation,
} = authApi;

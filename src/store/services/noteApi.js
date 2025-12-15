import { api } from "./api";

export const noteApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNotes: build.query({
      query: (params) => ({
        url: "/notes",
        method: "GET",
        params,
      }),
      providesTags: ["Notes"],
    }),

    createNote: build.mutation({
      query: (body) => ({
        url: "/notes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notes"],
    }),

    updateNote: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/notes/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Notes"],
    }),

    deleteNote: build.mutation({
      query: (id) => ({
        url: `/notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notes"],
    }),

    generateSummary: build.mutation({
      query: (id) => ({
        url: `/notes/${id}/summary`,
        method: "POST",
      }),
      invalidatesTags: ["Notes"],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGenerateSummaryMutation,
} = noteApi;

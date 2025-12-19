import { api } from "./api";

export const quizApi = api.injectEndpoints({
  endpoints: (build) => ({
    // 1. Generate Quiz
    generateQuiz: build.mutation({
      query: (body) => ({
        url: "/quiz/generate",
        method: "POST",
        body, // { noteId: "..." } or empty
      }),
    }),

    // 2. Submit Answers
    submitQuiz: build.mutation({
      query: (body) => ({
        url: "/quiz/submit",
        method: "POST",
        body, // { quizId, answers: {...} }
      }),
    }),

    // 3. Chat about Mistakes
    chatQuizMistake: build.mutation({
      query: (body) => ({
        url: "/quiz/chat",
        method: "POST",
        body, // { quizId, question: "..." }
      }),
    }),
  }),
});

export const {
  useGenerateQuizMutation,
  useSubmitQuizMutation,
  useChatQuizMistakeMutation,
} = quizApi;

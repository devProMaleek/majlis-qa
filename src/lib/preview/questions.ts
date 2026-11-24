import type { PreviewQuestion, QuestionStatus } from "./data";

export function filterQuestions(
  questions: readonly PreviewQuestion[],
  status: QuestionStatus,
  search: string,
) {
  const term = search.trim().toLocaleLowerCase();
  return questions.filter(
    (question) =>
      question.status === status &&
      `${question.id} ${question.summary} ${question.body}`
        .toLocaleLowerCase()
        .includes(term),
  );
}

export function countQuestions(
  questions: readonly PreviewQuestion[],
  status: QuestionStatus,
) {
  return questions.filter((question) => question.status === status).length;
}

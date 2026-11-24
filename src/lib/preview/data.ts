/** Public, invented fixtures for design review. Never place real attendee data here. */
export const pilotEvent = {
  name: "Knowledge Builder Course 2026",
  shortName: "KBC 2026",
  organisation: "Deen Communications",
  organisationSlug: "dcl",
  slug: "kbc-2026",
  dateLabel: "December 2026",
  status: "Draft",
  href: "/e/dcl/kbc-2026",
} as const;

export const previewSessions = [
  { id: "session-1", title: "Understanding Our Deen", order: 1 },
  { id: "session-2", title: "Questions and Answers", order: 2 },
  { id: "session-3", title: "Seeking Knowledge", order: 3 },
] as const;

export const questionStatuses = [
  "New",
  "Selected",
  "Answered",
  "Dismissed",
] as const;
export type QuestionStatus = (typeof questionStatuses)[number];

export type PreviewQuestion = {
  id: number;
  status: QuestionStatus;
  summary: string;
  body: string;
  receivedAt: string;
};

// Ordered newest first. Display times are fictional, as are the questions.
export const previewQuestions: readonly PreviewQuestion[] = [
  {
    id: 101,
    status: "New",
    receivedAt: "10:42 AM",
    summary: "What should someone do after missing a prayer unintentionally?",
    body: "What should a person do if they unintentionally miss a prayer and remember after its prescribed time?",
  },
  {
    id: 102,
    status: "New",
    receivedAt: "10:40 AM",
    summary: "How can someone distinguish sincerity from seeking praise?",
    body: "How can someone distinguish sincerity from seeking praise when doing good deeds?",
  },
  {
    id: 103,
    status: "Selected",
    receivedAt: "10:38 AM",
    summary: "How can we remain consistent in seeking knowledge?",
    body: "How can we remain consistent in seeking knowledge alongside our daily responsibilities?",
  },
  {
    id: 104,
    status: "Answered",
    receivedAt: "10:35 AM",
    summary: "How can families build a regular learning habit?",
    body: "What practical steps can help a family build a regular habit of learning together?",
  },
  {
    id: 105,
    status: "Dismissed",
    receivedAt: "10:32 AM",
    summary: "Will a recording of this lecture be available?",
    body: "Will a recording of this lecture be available after the event?",
  },
];

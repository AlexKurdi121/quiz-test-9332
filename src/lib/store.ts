// Each quiz question
export type Question = {
  text: string;
  options: string[];  // 4 multiple-choice options
  answer: number;     // index of correct option (0-3)
};

// Each participant
export type Participant = {
  name: string;
  answers: number[];  // participant's selected answers
};

// Quiz structure
export type Quiz = {
  code: string;               // unique code to join
  questions: Question[];      
  started: boolean;           // true if manager started the quiz
  participants: Participant[];
};

// In-memory store of quizzes
export const quizzes: Quiz[] = [];

// --- Helper functions ---

// Find a quiz by code
export const findQuiz = (code: string) => quizzes.find(q => q.code === code);

// Add a new quiz
export const addQuiz = (questions: Question[]): Quiz => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const quiz: Quiz = { code, questions, started: false, participants: [] };
  quizzes.push(quiz);
  return quiz;
};

// Add a participant to a quiz
export const addParticipant = (code: string, name: string): Participant | null => {
  const quiz = findQuiz(code);
  if (!quiz) return null;

  if (quiz.participants.find(p => p.name === name)) return null;

  const participant: Participant = { name, answers: Array(quiz.questions.length).fill(0) };
  quiz.participants.push(participant);
  return participant;
};

// Submit answers for a participant
export const submitAnswers = (code: string, name: string, answers: number[]): Participant | null => {
  const quiz = findQuiz(code);
  if (!quiz) return null;

  const participant = quiz.participants.find(p => p.name === name);
  if (!participant) return null;

  participant.answers = answers;
  return participant;
};

// Start a quiz
export const startQuiz = (code: string): Quiz | null => {
  const quiz = findQuiz(code);
  if (!quiz) return null;

  quiz.started = true;
  return quiz;
};

// Get results: participant with score
export const getResults = (code: string) => {
  const quiz = findQuiz(code);
  if (!quiz) return null;

  return quiz.participants.map(p => {
    const correctCount = p.answers.reduce(
      (acc, ans, i) => acc + (ans === quiz.questions[i].answer ? 1 : 0),
      0
    );
    return { ...p, correctCount };
  });
};

// Get winner
export const getWinner = (code: string) => {
  const results = getResults(code);
  if (!results || results.length === 0) return null;

  return results.reduce((prev, curr) => (curr.correctCount > prev.correctCount ? curr : prev));
};

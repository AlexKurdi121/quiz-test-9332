"use client";

import { useEffect, useState } from "react";

export default function ResultsDashboard() {
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/quizzes");
      const data = await res.json();
      setQuizzes(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Quiz Results</h1>

      {quizzes.map((quiz) => (
        <div key={quiz.id} className="mb-8 p-4 bg-gray-800 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
          {quiz.participants.map((p: any) => (
            <div key={p.id} className="mb-2 p-2 bg-gray-700 rounded">
              <p>
                {p.name} — Score: {p.score}/{quiz.questions.length}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

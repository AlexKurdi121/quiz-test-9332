"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewQuizPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], answer: 0 }
  ]);

  function addQuestion() {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], answer: 0 }]);
  }

  async function save() {
    await fetch("/api/quizzes", {
      method: "POST",
      body: JSON.stringify({ title, questions }),
    });

    router.push("/quizzes");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>

      <input
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded mb-6"
        placeholder="Quiz Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {questions.map((q, i) => (
        <div key={i} className="mb-6 p-4 bg-gray-800 rounded border border-gray-700">
          <input
            className="w-full mb-3 p-2 bg-gray-700 rounded"
            placeholder={`Question ${i + 1}`}
            value={q.text}
            onChange={(e) => {
              const copy = [...questions];
              copy[i].text = e.target.value;
              setQuestions(copy);
            }}
          />

          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, j) => (
              <input
                key={j}
                className="p-2 bg-gray-700 rounded"
                placeholder={`Option ${j + 1}`}
                value={opt}
                onChange={(e) => {
                  const copy = [...questions];
                  copy[i].options[j] = e.target.value;
                  setQuestions(copy);
                }}
              />
            ))}
          </div>

          <select
            className="mt-3 p-2 bg-gray-700 rounded"
            value={q.answer}
            onChange={(e) => {
              const copy = [...questions];
              copy[i].answer = Number(e.target.value);
              setQuestions(copy);
            }}
          >
            {q.options.map((_, j) => (
              <option value={j} key={j}>
                Correct Answer {j + 1}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="bg-blue-600 px-4 py-2 rounded mr-4"
      >
        + Add Question
      </button>

      <button
        onClick={save}
        className="bg-green-600 px-5 py-2 rounded"
      >
        Save Quiz
      </button>
    </div>
  );
}

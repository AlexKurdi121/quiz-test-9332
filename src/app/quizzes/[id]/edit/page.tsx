"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";

// ✅ Type definitions
type Question = {
  text: string;
  options: string[];
  answer: number;
};

type Quiz = {
  id: number;
  title: string;
  questions: Question[];
};

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/quizzes/${id}`);
      const data: Quiz = await res.json();
      setTitle(data.title);
      setQuestions(data.questions);
    }
    load();
  }, [id]);

  const saveQuiz = async () => {
    await fetch(`/api/quizzes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, questions }),
    });
    router.push("/quizzes");
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], answer: 0 },
    ]);
  };

  const updateQuestionText = (index: number, text: string) => {
    const copy = [...questions];
    copy[index].text = text;
    setQuestions(copy);
  };

  const updateOptionText = (qIndex: number, optIndex: number, value: string) => {
    const copy = [...questions];
    copy[qIndex].options[optIndex] = value;
    setQuestions(copy);
  };

  const updateAnswer = (qIndex: number, value: number) => {
    const copy = [...questions];
    copy[qIndex].answer = value;
    setQuestions(copy);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Edit Quiz</h1>

      <input
        className="w-full p-3 mb-6 bg-gray-800 rounded border border-gray-700"
        placeholder="Quiz Name"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
      />

      {questions.map((q, i) => (
        <div
          key={i}
          className="mb-6 p-4 bg-gray-800 rounded border border-gray-700"
        >
          <input
            className="w-full mb-3 p-2 bg-gray-700 rounded"
            placeholder={`Question ${i + 1}`}
            value={q.text}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateQuestionText(i, e.target.value)
            }
          />

          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt: string, j: number) => (
              <input
                key={j}
                className="p-2 bg-gray-700 rounded"
                placeholder={`Option ${j + 1}`}
                value={opt}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateOptionText(i, j, e.target.value)
                }
              />
            ))}
          </div>

          <select
            className="mt-3 p-2 bg-gray-700 rounded"
            value={q.answer}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              updateAnswer(i, Number(e.target.value))
            }
          >
            {q.options.map((_, j: number) => ( // ✅ Changed from (opt: string, j: number) to (_: string, j: number)
              <option value={j} key={j}>
                Correct Answer {j + 1}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={addQuestion}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Question
        </button>
        <button
          onClick={saveQuiz}
          className="bg-green-600 px-5 py-2 rounded hover:bg-green-700 transition"
        >
          Save Quiz
        </button>
      </div>
    </div>
  );
}
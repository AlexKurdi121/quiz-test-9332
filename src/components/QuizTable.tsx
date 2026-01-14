"use client";

import Link from "next/link";

type Quiz = {
  id: number;
  title: string;
  started: boolean;
  questions: any[];
  participants: any[];
};

type Props = {
  quizzes: Quiz[];
  onDelete: (id: number) => void;
  onStart: (id: number) => void;
  onStop: (id: number) => void;
};

export default function QuizTable({ quizzes, onDelete, onStart, onStop }: Props) {
  return (
    <table className="w-full border-collapse bg-gray-900 rounded overflow-hidden">
      <thead>
        <tr className="bg-gray-800 text-left">
          <th className="p-3 border border-gray-700">ID</th>
          <th className="p-3 border border-gray-700">Name</th>
          <th className="p-3 border border-gray-700">Questions</th>
          <th className="p-3 border border-gray-700">Participants</th>
          <th className="p-3 border border-gray-700">Actions</th>
        </tr>
      </thead>

      <tbody>
        {quizzes.map((q) => (
          <tr key={q.id} className="border-t border-gray-700">
            <td className="p-3">{q.id}</td>
            <td className="p-3">{q.title}</td>
            <td className="p-3">{q.questions.length}</td>
            <td className="p-3">{q.participants.length}</td>
            <td className="p-3 flex gap-2">
              <Link
                href={`/quizzes/${q.id}/edit`}
                className="bg-yellow-600 px-3 py-1 rounded"
              >
                Edit
              </Link>
              <button
                onClick={() => onDelete(q.id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Delete
              </button>
              {q.started ? (
                <button
                  onClick={() => onStop(q.id)}
                  className="bg-gray-600 px-3 py-1 rounded"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={() => onStart(q.id)}
                  className="bg-green-600 px-3 py-1 rounded"
                >
                  Start
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

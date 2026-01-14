'use client';
// Remove the unused React import
// import React from 'react';
import { Quiz } from '@/lib/store';

type Props = {
  quiz: Quiz;
  onStart: (code: string) => void;
  onShowResults: (quiz: Quiz) => void;
  onDelete?: (code: string) => void;
};

export default function QuizCard({ quiz, onStart, onShowResults, onDelete }: Props) {
  return (
    <div className="border p-4 rounded shadow-sm bg-white flex justify-between items-center hover:shadow-md transition">
      <div>
        <p><b>Code:</b> {quiz.code}</p>
        <p>Started: {quiz.started ? 'Yes' : 'No'}</p>
        <p>Questions: {quiz.questions.length}</p>
        <p>Participants: {quiz.participants.length}</p>
      </div>
      <div className="flex space-x-2">
        {!quiz.started && (
          <button
            onClick={() => onStart(quiz.code)}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
          >
            Start
          </button>
        )}
        <button
          onClick={() => onShowResults(quiz)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        >
          Results
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(quiz.code)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
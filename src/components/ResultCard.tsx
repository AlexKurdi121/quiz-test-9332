'use client';
// Remove unused React import
// import React from 'react';
import { Quiz, Participant } from '@/lib/store';

type Props = {
  quiz: Quiz;
  participant: Participant & { correctCount: number };
};

export default function ResultCard({ quiz, participant }: Props) {
  return (
    <div className="border p-4 rounded shadow-sm bg-white mb-3 hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <p className="font-bold text-lg">{participant.name}</p>
        <p className="font-semibold">
          Score: {participant.correctCount}/{quiz.questions.length}
        </p>
      </div>
      <ul className="mt-2 space-y-1">
        {quiz.questions.map((q, i) => (
          <li key={i} className="border-b pb-1">
            <p className="font-medium">{q.text}</p>
            <p>
              Your answer: {q.options[participant.answers[i]]}{' '}
              {participant.answers[i] === q.answer ? (
                <span className="text-green-600 font-bold ml-2">✔</span>
              ) : (
                <span className="text-red-600 font-bold ml-2">✖</span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
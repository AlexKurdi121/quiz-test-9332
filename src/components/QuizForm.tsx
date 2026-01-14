'use client';
import { useState } from 'react';
import QuestionInput from './QuestionInput';

export default function QuizForm() {
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddQuestions = () => {
    setQuestions(Array(numQuestions).fill({ text: '', options: ['', '', '', ''], answer: 0 }));
  };

  const updateQuestion = (index: number, q: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = q;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!title) return alert('Please enter quiz title');
    if (questions.length === 0) return alert('Please add questions');

    setLoading(true);

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, questions }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Error: ' + (err.error || 'Failed to create quiz'));
        setLoading(false);
        return;
      }

      const quiz = await res.json();
      alert(`Quiz created! Join code: ${quiz.code}`);

      // reset form
      setTitle('');
      setQuestions([]);
      setNumQuestions(1);
    } catch (err) {
      console.error(err);
      alert('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded shadow-md">
      <input
        type="text"
        placeholder="Quiz Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-800 rounded border border-gray-700"
      />

      <div className="flex mb-4">
        <input
          type="number"
          min={1}
          value={numQuestions}
          onChange={e => setNumQuestions(Number(e.target.value))}
          className="border p-1 rounded w-24 mr-2 bg-gray-800 text-white"
        />
        <button
          onClick={handleAddQuestions}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Add Questions
        </button>
      </div>

      {questions.map((_, i) => ( // ✅ Changed from (q, i) to (_, i)
        <QuestionInput
          key={i}
          index={i}
          question={questions[i]}
          onChange={q => updateQuestion(i, q)}
        />
      ))}

      {questions.length > 0 && (
        <button
          onClick={handleSubmit}
          className={`mt-4 px-4 py-2 rounded ${loading ? 'bg-gray-500' : 'bg-green-500'}`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Quiz'}
        </button>
      )}
    </div>
  );
}
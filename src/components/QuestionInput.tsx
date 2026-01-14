'use client';
import { useState, useEffect } from 'react';

type Props = {
  index: number;
  onChange: (q: any) => void;
  question?: { text: string; options: string[]; answer: number };
};

export default function QuestionInput({ index, onChange, question }: Props) {
  const [text, setText] = useState(question?.text || '');
  const [options, setOptions] = useState(question?.options || ['', '', '', '']);
  const [answer, setAnswer] = useState(question?.answer || 0);

  useEffect(() => {
    onChange({ text, options, answer });
  }, [text, options, answer]);

  const handleOptionChange = (i: number, value: string) => {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
  };

  return (
    <div className="border p-4 mb-4 rounded shadow-sm bg-dark">
      <input
        type="text"
        placeholder={`Question ${index + 1}`}
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      {options.map((opt, i) => (
        <div key={i} className="flex items-center mb-1">
          <input
            type="radio"
            name={`q${index}`}
            checked={answer === i}
            onChange={() => setAnswer(i)}
            className="mr-2"
          />
          <input
            type="text"
            value={opt}
            onChange={e => handleOptionChange(i, e.target.value)}
            className="border p-1 rounded w-full"
            placeholder={`Option ${i + 1}`}
          />
        </div>
      ))}
    </div>
  );
}

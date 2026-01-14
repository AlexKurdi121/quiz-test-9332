import { NextRequest, NextResponse } from 'next/server';
import { quizzes, Participant } from '@/lib/store';

// POST: join quiz
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, name } = body as { code: string; name: string };

  const quiz = quizzes.find(q => q.code === code);
  if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

  if (quiz.participants.find(p => p.name === name))
    return NextResponse.json({ message: 'Name already taken' }, { status: 400 });

  const participant: Participant = { name, answers: [] };
  quiz.participants.push(participant);

  return NextResponse.json({ quiz });
}

// PUT: submit answers
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { code, name, answers } = body as { code: string; name: string; answers: number[] };

  const quiz = quizzes.find(q => q.code === code);
  if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

  const participant = quiz.participants.find(p => p.name === name);
  if (!participant) return NextResponse.json({ message: 'Participant not found' }, { status: 404 });

  participant.answers = answers;
  return NextResponse.json({ participant });
}

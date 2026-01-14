import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all quizzes
export async function GET() {
  const quizzes = await prisma.quiz.findMany({
    include: { questions: true, participants: true }
  });
  return NextResponse.json(quizzes);
}

// POST a new quiz
export async function POST(req: Request) {
  const body = await req.json();
  const { title, questions } = body;

  // generate unique code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const quiz = await prisma.quiz.create({
    data: {
      title,
      code,
      questions: {
        create: questions.map((q: any) => ({
          text: q.text,
          options: q.options,
          answer: q.answer,
        })),
      },
    },
    include: { questions: true, participants: true },
  });

  return NextResponse.json(quiz);
}

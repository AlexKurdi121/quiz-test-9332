import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    
    if (!code) {
      return NextResponse.json(
        { error: "Quiz code required" },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await req.json();
    const { name, answers } = body;

    // Validate inputs
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Answers array is required" },
        { status: 400 }
      );
    }

    // Check if quiz exists and is started
    const quiz = await prisma.quiz.findUnique({
      where: { code },
      include: { questions: true }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (!quiz.started) {
      return NextResponse.json(
        { error: "Quiz is not active" },
        { status: 400 }
      );
    }

    // Validate answers length matches questions
    if (answers.length !== quiz.questions.length) {
      return NextResponse.json(
        { error: `Expected ${quiz.questions.length} answers, got ${answers.length}` },
        { status: 400 }
      );
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        score++;
      }
    });

    // Save participant
    const participant = await prisma.participant.create({
      data: {
        name: name.trim(),
        answers: answers,
        score: score,
        quizId: quiz.id,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Answers submitted successfully",
      participant: {
        id: participant.id,
        name: participant.name,
        score: participant.score,
      },
      score: score,
      totalQuestions: quiz.questions.length
    });
  } catch (error: any) {
    console.error("Submit quiz error:", error);
    
    // Handle duplicate participant name for same quiz
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A participant with this name already exists for this quiz" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to submit answers" },
      { status: 500 }
    );
  }
}
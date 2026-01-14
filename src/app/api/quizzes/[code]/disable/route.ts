import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _: NextRequest,
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

    // First check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { code }
    });

    if (!existingQuiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Update quiz to disable
    const quiz = await prisma.quiz.update({
      where: { code },
      data: { started: false },
      include: {
        questions: true
      }
    });

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("Disable quiz error:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to disable quiz" },
      { status: 500 }
    );
  }
}
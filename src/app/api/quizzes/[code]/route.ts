import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch a specific quiz by code
export async function GET(
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

    const quiz = await prisma.quiz.findUnique({
      where: { code },
      include: {
        questions: true,
        participants: true
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Transform participants for frontend
    const transformedQuiz = {
      ...quiz,
      participants: quiz.participants.map(p => ({
        id: p.id,
        name: p.name,
        answers: p.answers,
        score: p.score,
      }))
    };

    return NextResponse.json(transformedQuiz);
  } catch (error: any) {
    console.error("GET quiz error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// PUT: Update a quiz
export async function PUT(
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

    const body = await req.json();
    const { title, questions } = body;

    if (!title || !questions) {
      return NextResponse.json(
        { error: "Title and questions are required" },
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

    // Update quiz with transaction
    const updatedQuiz = await prisma.$transaction(async (tx) => {
      // Delete existing questions
      await tx.question.deleteMany({
        where: { quizId: existingQuiz.id }
      });

      // Update quiz and create new questions
      return await tx.quiz.update({
        where: { code },
        data: {
          title,
          questions: {
            create: questions.map((q: any) => ({  // ✅ Removed unused index parameter
              text: q.text,
              options: q.options,
              answer: q.answer,
            }))
          }
        },
        include: {
          questions: true,
          participants: true
        }
      });
    });

    return NextResponse.json(updatedQuiz);
  } catch (error: any) {
    console.error("UPDATE quiz error:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a quiz
export async function DELETE(
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
    const quiz = await prisma.quiz.findUnique({
      where: { code }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Delete quiz (participants and questions will cascade delete if foreign key constraints are set)
    await prisma.quiz.delete({
      where: { code }
    });

    return NextResponse.json(
      { message: "Quiz deleted successfully" }
    );
  } catch (error: any) {
    console.error("DELETE quiz error:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
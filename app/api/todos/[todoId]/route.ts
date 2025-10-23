import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prisma";

interface Props {
  params: Promise<{ todoId: string }>;
}

// GET a single todo by ID
export async function GET(req: NextRequest, { params }: Props) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { todoId } = await params;

  if (!todoId) {
    return NextResponse.json({ error: "Todo ID required" }, { status: 400 });
  }

  try {
    const todo = await prismadb.todo.findFirst({
      where: { id: todoId, userId },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo, { status: 200 });
  } catch (e) {
    console.error("Error fetching todo:", e);
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 500 },
    );
  }
}

// PUT - Update a todo
export async function PUT(req: NextRequest, { params }: Props) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { todoId } = await params;

  if (!todoId) {
    return NextResponse.json({ error: "Todo ID required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, completed } = body;

    // Validate that at least one field is being updated
    if (title === undefined && completed === undefined) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    // Check if todo exists and belongs to user
    const todo = await prismadb.todo.findFirst({
      where: { id: todoId, userId },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    // Update the todo
    const updatedTodo = await prismadb.todo.update({
      where: { id: todoId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(completed !== undefined && { completed }),
      },
    });

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (e) {
    console.error("Error updating todo:", e);
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 500 },
    );
  }
}

// DELETE a todo
export async function DELETE(req: NextRequest, { params }: Props) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { todoId } = await params;

  if (!todoId) {
    return NextResponse.json({ error: "Todo ID required" }, { status: 400 });
  }

  try {
    // Check if todo exists and belongs to user
    const todo = await prismadb.todo.findFirst({
      where: { id: todoId, userId },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    // Delete the todo
    await prismadb.todo.delete({
      where: { id: todoId },
    });

    return NextResponse.json(
      { message: "Todo deleted successfully" },
      { status: 200 },
    );
  } catch (e) {
    console.error("Error deleting todo:", e);
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 500 },
    );
  }
}

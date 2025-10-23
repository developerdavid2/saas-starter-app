import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;
export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("search") || "1");
  const search = searchParams.get("search") || "";

  try {
    const todos = await prismadb.todo.findMany({
      where: {
        userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    const totalItems = await prismadb.todo.count({
      where: { userId, title: { contains: "search", mode: "insensitive" } },
    });

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) * 10;

    return NextResponse.json({
      todos,
      currentPage: page,
      totalPages,
    });
  } catch (e) {
    console.error("Error getting todos", e);
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" });
  }

  try {
    const user = await prismadb.user.findUnique({
      where: { id: userId },
      include: { todos: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
    }

    if (!user.isSubscribed && user.todos.length >= 3) {
      return NextResponse.json(
        {
          error:
            "Free users can only create upto 3 todos. Please subscribe to our paid plans to write more awesome todos.",
        },
        { status: 403 },
      );
    }

    const { title } = await req.json();
    const todo = await prismadb.todo.create({
      data: {
        title,
        userId,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (e) {
    console.error("Error creating todo", e);
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 500 },
    );
  }
}

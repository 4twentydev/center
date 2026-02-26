import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          assignedJobs: { where: { status: { not: "complete" } } },
          timeEntries: { where: { clockOut: null } },
        },
      },
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email || null,
      pin: body.pin || null,
      role: body.role || "technician",
    },
  });

  return NextResponse.json(user, { status: 201 });
}

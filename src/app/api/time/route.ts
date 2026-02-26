import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const active = searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (active === "true") where.clockOut = null;

  const entries = await prisma.timeEntry.findMany({
    where,
    include: { user: true, job: true },
    orderBy: { clockIn: "desc" },
    take: 50,
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Clock in
  const entry = await prisma.timeEntry.create({
    data: {
      userId: body.userId,
      jobId: body.jobId || null,
      type: body.type || "shift",
      notes: body.notes || null,
    },
    include: { user: true, job: true },
  });

  return NextResponse.json(entry, { status: 201 });
}

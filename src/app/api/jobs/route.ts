import { prisma } from "@/lib/db";
import { generateJobNumber } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { jobNumber: { contains: search } },
      { customer: { contains: search } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    include: { assignedTo: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const job = await prisma.job.create({
    data: {
      jobNumber: generateJobNumber(),
      title: body.title,
      description: body.description || null,
      status: body.status || "queued",
      priority: body.priority || "normal",
      customer: body.customer || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      estimatedHours: body.estimatedHours ? parseFloat(body.estimatedHours) : null,
      assignedToId: body.assignedToId || null,
      createdById: body.createdById,
    },
  });

  return NextResponse.json(job, { status: 201 });
}

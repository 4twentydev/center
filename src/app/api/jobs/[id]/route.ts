import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      createdBy: true,
      materials: { include: { inventoryItem: true } },
      timeEntries: { include: { user: true } },
      comments: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.customer !== undefined) data.customer = body.customer;
  if (body.assignedToId !== undefined) data.assignedToId = body.assignedToId || null;
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.estimatedHours !== undefined) data.estimatedHours = body.estimatedHours ? parseFloat(body.estimatedHours) : null;

  if (body.status !== undefined) {
    data.status = body.status;
    if (body.status === "in_progress" && !data.startedAt) {
      data.startedAt = new Date();
    }
    if (body.status === "complete") {
      data.completedAt = new Date();
    }
  }

  const job = await prisma.job.update({
    where: { id },
    data,
    include: { assignedTo: true },
  });

  return NextResponse.json(job);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

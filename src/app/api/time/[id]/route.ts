import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};

  // Clock out
  if (body.clockOut === true) {
    data.clockOut = new Date();
  }
  if (body.breakMins !== undefined) data.breakMins = parseInt(body.breakMins);
  if (body.notes !== undefined) data.notes = body.notes;

  const entry = await prisma.timeEntry.update({
    where: { id },
    data,
    include: { user: true, job: true },
  });

  return NextResponse.json(entry);
}

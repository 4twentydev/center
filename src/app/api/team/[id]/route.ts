import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email || null;
  if (body.pin !== undefined) data.pin = body.pin;
  if (body.role !== undefined) data.role = body.role;
  if (body.active !== undefined) data.active = body.active;

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  return NextResponse.json(user);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.user.update({
    where: { id },
    data: { active: false },
  });
  return NextResponse.json({ success: true });
}

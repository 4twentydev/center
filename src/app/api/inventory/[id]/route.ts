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
  if (body.sku !== undefined) data.sku = body.sku || null;
  if (body.description !== undefined) data.description = body.description;
  if (body.category !== undefined) data.category = body.category;
  if (body.quantity !== undefined) data.quantity = parseInt(body.quantity);
  if (body.unit !== undefined) data.unit = body.unit;
  if (body.minStock !== undefined) data.minStock = parseInt(body.minStock);
  if (body.costPerUnit !== undefined) data.costPerUnit = body.costPerUnit ? parseFloat(body.costPerUnit) : null;
  if (body.location !== undefined) data.location = body.location;

  // Handle stock adjustment (add/subtract)
  if (body.adjustQuantity !== undefined) {
    const current = await prisma.inventoryItem.findUnique({ where: { id } });
    if (current) {
      data.quantity = current.quantity + parseInt(body.adjustQuantity);
    }
  }

  const item = await prisma.inventoryItem.update({
    where: { id },
    data,
  });

  return NextResponse.json(item);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.inventoryItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

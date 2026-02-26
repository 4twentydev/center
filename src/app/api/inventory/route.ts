import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const lowStock = searchParams.get("lowStock");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (category && category !== "all") {
    where.category = category;
  }

  let items = await prisma.inventoryItem.findMany({
    where,
    orderBy: { name: "asc" },
  });

  if (lowStock === "true") {
    items = items.filter((item) => item.minStock > 0 && item.quantity <= item.minStock);
  }

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const item = await prisma.inventoryItem.create({
    data: {
      name: body.name,
      sku: body.sku || null,
      description: body.description || null,
      category: body.category || null,
      quantity: parseInt(body.quantity) || 0,
      unit: body.unit || "ea",
      minStock: parseInt(body.minStock) || 0,
      costPerUnit: body.costPerUnit ? parseFloat(body.costPerUnit) : null,
      location: body.location || null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
